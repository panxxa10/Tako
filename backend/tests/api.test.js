// Pruebas de integración contra PostgreSQL real (PGlite en memoria): rutas, SQL, recompensas, rachas, tienda.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'secreto-de-pruebas';

const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const db = require('../db');
const app = require('../app');
const { addDays, utcToday } = require('../utils/dates');

const TODAY = utcToday();
let token;
const api = (method, url) => request(app)[method](url).set('Authorization', `Bearer ${token}`);

test.before(async () => { await db.init(); });
test.after(async () => { await db.close(); });

async function register(name = 'ama', email = `${name}@test.com`) {
  const res = await request(app).post('/api/auth/register').send({ username: name, email, password: 'clave-segura-123' });
  assert.equal(res.status, 201, JSON.stringify(res.body));
  return res.body.token;
}
const addTask = async (title, extra = {}) => (await api('post', '/api/tasks').send({ title, date: TODAY, ...extra })).body.task;

test('salud, 404 y rutas protegidas', async () => {
  assert.equal((await request(app).get('/api/health')).body.status, 'ok');
  assert.equal((await request(app).get('/api/nada')).status, 404);
  assert.equal((await request(app).get('/api/me')).status, 401);
  assert.equal((await request(app).get('/api/tasks').set('Authorization', 'Bearer basura')).status, 401);
});

test('registro: validaciones, duplicados y login genérico', async () => {
  for (const body of [
    { username: 'ab', email: 'a@b.co', password: '12345678' },
    { username: 'abc', email: 'mal', password: '12345678' },
    { username: 'abc', email: 'a@b.co', password: '123' },
  ]) assert.equal((await request(app).post('/api/auth/register').send(body)).status, 400);

  token = await register('ama');
  const dupEmail = await request(app).post('/api/auth/register').send({ username: 'otra', email: 'AMA@test.com', password: 'clave-segura-123' });
  assert.equal(dupEmail.status, 409);
  assert.match(dupEmail.body.message, /correo/);
  const dupUser = await request(app).post('/api/auth/register').send({ username: 'AMA', email: 'x@test.com', password: 'clave-segura-123' });
  assert.equal(dupUser.status, 409);
  assert.match(dupUser.body.message, /usuario/);

  assert.equal((await request(app).post('/api/auth/login').send({ email: 'ama@test.com', password: 'incorrecta' })).status, 401);
  assert.equal((await request(app).post('/api/auth/login').send({ email: 'nadie@test.com', password: 'x' })).status, 401);
  assert.equal((await request(app).post('/api/auth/login').send({ email: 'ama@test.com', password: 'clave-segura-123' })).status, 200);
});

test('perfil inicial: 30 monedas, nivel 1, mascota por defecto', async () => {
  const { body } = await api('get', '/api/me');
  assert.equal(body.progress.coins, 30);
  assert.equal(body.progress.level, 1);
  assert.equal(body.progress.streak, 0);
  assert.equal(body.pet.name, 'Tako');
  assert.ok(body.inventory.includes('shell_green'));
});

test('completar tareas da XP/monedas una sola vez, bono de meta y logros', async () => {
  const a = await addTask('Estudiar SQL', { category: 'estudio' });
  const b = await addTask('Ejercicio', { category: 'salud' });
  const c = await addTask('Leer');

  let r = await api('post', `/api/tasks/${a.id}/toggle`);
  assert.equal(r.status, 200);
  assert.equal(r.body.task.completed, true);
  assert.equal(r.body.rewards.xp, 10);
  assert.equal(r.body.rewards.coins, 5);
  assert.deepEqual(r.body.achievements.map((x) => x.id), ['first_task']);
  assert.equal(r.body.me.progress.streak, 1);
  assert.equal(r.body.me.progress.coins, 30 + 5 + 10); // regalo + tarea + logro "Primer paso"

  // desmarcar y volver a marcar NO repite la recompensa
  await api('post', `/api/tasks/${a.id}/toggle`);
  r = await api('post', `/api/tasks/${a.id}/toggle`);
  assert.equal(r.body.rewards.xp, 0);
  assert.equal(r.body.me.progress.totalCompleted, 1);

  await api('post', `/api/tasks/${b.id}/toggle`);
  r = await api('post', `/api/tasks/${c.id}/toggle`);
  assert.equal(r.body.rewards.goalReached, true);          // meta diaria por defecto = 3
  assert.equal(r.body.rewards.xp, 10 + 20);
  assert.equal(r.body.me.progress.goalReached, true);
  const ids = r.body.achievements.map((x) => x.id);
  assert.ok(ids.includes('goal_1') && ids.includes('perfect_day') && ids.includes('tasks_10') === false);
});

test('borrar una tarea completada conserva XP y racha', async () => {
  const before = (await api('get', '/api/me')).body.progress;
  const { body: list } = await api('get', `/api/tasks?from=${TODAY}&to=${TODAY}`);
  await api('delete', `/api/tasks/${list[0].id}`);
  const after = (await api('get', '/api/me')).body.progress;
  assert.equal(after.xp, before.xp);
  assert.equal(after.streak, before.streak);
  assert.equal((await api('get', `/api/tasks?from=${TODAY}&to=${TODAY}`)).body.length, 2);
});

test('tope diario de recompensas', async () => {
  const tk = await register('tope');
  const prev = token; token = tk;
  let last;
  for (let i = 0; i < 12; i++) {
    const task = await addTask(`t${i}`);
    last = await api('post', `/api/tasks/${task.id}/toggle`);
  }
  assert.equal(last.body.rewards.capped, true);
  assert.equal(last.body.rewards.xp, 0);
  assert.equal(last.body.me.progress.totalCompleted, 10);
  assert.equal(last.body.me.progress.doneToday, 12); // sí cuentan para la racha
  token = prev;
});

test('tareas repetitivas, edición, atrasadas y reprogramar', async () => {
  const r = await api('post', '/api/tasks').send({ title: 'Tomar agua', date: TODAY, repeat: 'daily' });
  assert.equal(r.body.created, 28);
  const id = r.body.task.id;
  const edited = await api('patch', `/api/tasks/${id}`).send({ title: 'Tomar más agua', category: 'salud' });
  assert.equal(edited.body.title, 'Tomar más agua');
  assert.equal((await api('delete', `/api/tasks/${id}?series=1`)).body.deleted, 28);

  const old = await api('post', '/api/tasks').send({ title: 'Vieja', date: addDays(TODAY, -3) });
  assert.equal((await api('get', '/api/tasks/overdue')).body.length, 1);
  assert.equal((await api('post', '/api/tasks/reschedule').send({})).body.moved, 1);
  assert.equal((await api('get', '/api/tasks/overdue')).body.length, 0);
  assert.ok(old.body.task.id);
});

test('validaciones de tareas', async () => {
  assert.equal((await api('post', '/api/tasks').send({ title: ' ', date: TODAY })).status, 400);
  assert.equal((await api('post', '/api/tasks').send({ title: 'x', date: 'mañana' })).status, 400);
  assert.equal((await api('post', '/api/tasks').send({ title: 'x', date: TODAY, category: 'nope' })).status, 400);
  assert.equal((await api('get', '/api/tasks?from=2026-01-01')).status, 400);
  assert.equal((await api('post', '/api/tasks/abc/toggle')).status, 400);
  assert.equal((await api('post', '/api/tasks/999999/toggle')).status, 404);
});

test('una tarea ajena no se puede tocar', async () => {
  const task = await addTask('mía');
  const other = await register('intruso');
  const res = await request(app).post(`/api/tasks/${task.id}/toggle`).set('Authorization', `Bearer ${other}`);
  assert.equal(res.status, 404);
});

test('tienda: compra, saldo insuficiente, equipar y logros', async () => {
  const tk = await register('tienda');
  const prev = token; token = tk;

  assert.equal((await api('post', '/api/shop/buy').send({ itemId: 'hat_crown' })).status, 400); // 150 monedas, tiene 30
  const buy = await api('post', '/api/shop/buy').send({ itemId: 'hat_flower' });                  // 30 monedas
  assert.equal(buy.status, 201);
  assert.equal(buy.body.me.progress.coins, 0 + 10);                                              // +10 por logro "De compras"
  assert.deepEqual(buy.body.achievements.map((a) => a.id), ['shopper']);
  assert.equal((await api('post', '/api/shop/buy').send({ itemId: 'hat_flower' })).status, 400);

  assert.equal((await api('put', '/api/me/pet').send({ hat: 'hat_crown' })).status, 403);         // no lo tiene
  const eq = await api('put', '/api/me/pet').send({ hat: 'hat_flower', name: 'Pepa', shell: 'shell_teal' });
  assert.equal(eq.status, 200);
  assert.equal(eq.body.me.pet.hat, 'hat_flower');
  assert.equal(eq.body.me.pet.name, 'Pepa');
  assert.equal((await api('put', '/api/me/pet').send({ hat: 'glasses_sun' })).status, 400);       // artículo de otra ranura
  assert.equal((await api('put', '/api/me/pet').send({ hat: null })).body.me.pet.hat, null);
  const shop = (await api('get', '/api/shop')).body;
  assert.equal(shop.items.find((i) => i.id === 'hat_flower').owned, true);
  token = prev;
});

test('escudo de racha: se compra y salva un día perdido', async () => {
  const tk = await register('racha');
  const prev = token; token = tk;
  const uid = (await api('get', '/api/me')).body.user.id;

  // historial: actividad hace 3 y 2 días; ayer sin actividad; hoy sin actividad
  for (const d of [addDays(TODAY, -3), addDays(TODAY, -2)]) {
    await db.query("INSERT INTO tasks (user_id, title, date, completed, completed_on, reward_claimed) VALUES ($1, 'x', $2, TRUE, $2, TRUE)", [uid, d]);
  }
  await db.query('UPDATE users SET coins = 200, streak_freezes = 1, last_settled = NULL WHERE id = $1', [uid]);

  const me = (await api('get', '/api/me')).body.progress;
  assert.equal(me.freezes, 0);               // el escudo se gastó en el día perdido
  assert.equal(me.streak, 2);                // la racha sigue viva (ayer congelado)
  assert.equal(me.streakAtRisk, true);

  // límite de escudos
  assert.equal((await api('post', '/api/shop/buy').send({ itemId: 'freeze' })).status, 201);
  assert.equal((await api('post', '/api/shop/buy').send({ itemId: 'freeze' })).status, 201);
  assert.equal((await api('post', '/api/shop/buy').send({ itemId: 'freeze' })).status, 400);
  token = prev;
});

test('racha rota sin escudos', async () => {
  const tk = await register('rota');
  const prev = token; token = tk;
  const uid = (await api('get', '/api/me')).body.user.id;
  for (const d of [addDays(TODAY, -5), addDays(TODAY, -4), addDays(TODAY, -3)]) {
    await db.query("INSERT INTO tasks (user_id, title, date, completed, completed_on, reward_claimed) VALUES ($1, 'x', $2, TRUE, $2, TRUE)", [uid, d]);
  }
  const me = (await api('get', '/api/me')).body.progress;
  assert.equal(me.streak, 0);
  assert.equal(me.bestStreak, 3);
  token = prev;
});

test('consejos y gráficas', async () => {
  const { status, body } = await api('get', '/api/insights');
  assert.equal(status, 200);
  assert.ok(Array.isArray(body.items) && body.items.length > 0);
  assert.equal(body.days.length, 28);
  assert.ok(body.summary.mood);
});

test('premios personalizados: crear, canjear con monedas, saldo insuficiente', async () => {
  const tk = await register('premios');
  const prev = token; token = tk;
  const created = await api('post', '/api/shop/rewards').send({ title: 'Ver un capítulo', emoji: '📺', cost: 20 });
  assert.equal(created.status, 201);
  const big = await api('post', '/api/shop/rewards').send({ title: 'Viaje', emoji: '✈️', cost: 500 });
  const ok = await api('post', `/api/shop/rewards/${created.body.id}/redeem`);
  assert.equal(ok.body.me.progress.coins, 10);
  assert.equal((await api('post', `/api/shop/rewards/${created.body.id}/redeem`)).status, 400);
  assert.equal((await api('post', `/api/shop/rewards/${big.body.id}/redeem`)).status, 400);
  assert.equal((await api('get', '/api/shop/rewards')).body[0].timesRedeemed, 1);
  assert.equal((await api('delete', `/api/shop/rewards/${big.body.id}`)).status, 200);
  assert.equal((await api('post', '/api/shop/rewards').send({ title: 'x', cost: 1 })).status, 400);
  token = prev;
});

test('enfoque: recompensa con tope diario', async () => {
  const tk = await register('enfoque');
  const prev = token; token = tk;
  assert.equal((await api('post', '/api/focus').send({ minutes: 5 })).body.rewards.coins, 0);
  const first = await api('post', '/api/focus').send({ minutes: 25 });
  assert.equal(first.body.rewards.coins, 3);
  assert.ok(first.body.achievements.some((a) => a.id === 'focus_1'));
  for (let i = 0; i < 3; i++) await api('post', '/api/focus').send({ minutes: 25 });
  assert.equal((await api('post', '/api/focus').send({ minutes: 25 })).body.rewards.capped, true);
  token = prev;
});

test('ajustes: meta diaria, tema, contraseña y borrar cuenta', async () => {
  const tk = await register('ajustes');
  const prev = token; token = tk;
  const r = await api('patch', '/api/me').send({ dailyGoal: 5, theme: 'dark', occupation: 'Estudiante', onboarded: true });
  assert.equal(r.body.user.dailyGoal, 5);
  assert.equal(r.body.user.theme, 'dark');
  assert.equal((await api('patch', '/api/me').send({ dailyGoal: 99 })).status, 400);
  assert.equal((await api('patch', '/api/me').send({ username: 'ama' })).status, 409); // ya existe

  assert.equal((await api('post', '/api/auth/password').send({ currentPassword: 'mala', newPassword: 'nueva-clave-123' })).status, 401);
  assert.equal((await api('post', '/api/auth/password').send({ currentPassword: 'clave-segura-123', newPassword: 'nueva-clave-123' })).status, 200);
  assert.equal((await request(app).post('/api/auth/login').send({ email: 'ajustes@test.com', password: 'nueva-clave-123' })).status, 200);

  assert.equal((await api('delete', '/api/auth/me').send({ password: 'mala' })).status, 401);
  assert.equal((await api('delete', '/api/auth/me').send({ password: 'nueva-clave-123' })).status, 200);
  assert.equal((await request(app).post('/api/auth/login').send({ email: 'ajustes@test.com', password: 'nueva-clave-123' })).status, 401);
  token = prev;
});

test('fecha del cliente: se acepta ±1 día y se ignora si es falsa', async () => {
  const tk = await register('fecha');
  const prev = token; token = tk;
  const task = await addTask('t');
  const far = await request(app).post(`/api/tasks/${task.id}/toggle`).set('Authorization', `Bearer ${token}`).set('X-Client-Date', addDays(TODAY, -30));
  assert.equal(far.body.task.completedOn, TODAY); // fecha falsa ignorada
  token = prev;
});
