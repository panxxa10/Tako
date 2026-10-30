const test = require('node:test');
const assert = require('node:assert');
const { computeStreaks, settleFreezes } = require('../domain/streak');
const { levelFromXp } = require('../domain/levels');
const { buildInsights } = require('../domain/insights');
const { CATEGORIES } = require('../domain/catalog');
const { addDays, weekday } = require('../utils/dates');

test('nivel: curva de XP y título', () => {
  assert.deepEqual(levelFromXp(0), { level: 1, xpInLevel: 0, xpForNext: 50, title: 'Huevito' });
  assert.equal(levelFromXp(50).level, 2);
  assert.equal(levelFromXp(49).level, 1);
  assert.equal(levelFromXp(50 + 75).level, 3);
  assert.equal(levelFromXp(5000).title, 'Leyenda');
});

test('racha: sigue viva si hoy aún no hay actividad pero ayer sí', () => {
  assert.equal(computeStreaks(['2026-03-08', '2026-03-09'], [], '2026-03-10').streak, 2);
});

test('racha: se rompe si falta un día', () => {
  const r = computeStreaks(['2026-03-01', '2026-03-02', '2026-03-03'], [], '2026-03-10');
  assert.deepEqual(r, { streak: 0, bestStreak: 3 });
});

test('racha: un día congelado mantiene la racha sin sumar', () => {
  const r = computeStreaks(['2026-03-07', '2026-03-09', '2026-03-10'], ['2026-03-08'], '2026-03-10');
  assert.equal(r.streak, 3);
  assert.equal(r.bestStreak, 3);
});

test('racha: mejor racha mayor que la actual', () => {
  const days = ['2026-02-01', '2026-02-02', '2026-02-03', '2026-02-04', '2026-02-10', '2026-02-11'];
  assert.deepEqual(computeStreaks(days, [], '2026-02-11'), { streak: 2, bestStreak: 4 });
});

test('escudos: solo salvan días que rompían una racha viva', () => {
  // actividad el 1 y el 2; faltan el 3 y el 4; hoy es el 5. Con 1 escudo se salva el 3 pero el 4 rompe.
  const r = settleFreezes(['2026-03-01', '2026-03-02'], [], '2026-03-03', '2026-03-05', 1);
  assert.deepEqual(r, { frozen: ['2026-03-03'], freezesLeft: 0 });
  // sin racha previa no se gasta nada
  assert.deepEqual(settleFreezes([], [], '2026-03-03', '2026-03-05', 2), { frozen: [], freezesLeft: 2 });
  // con 2 escudos se salvan ambos
  assert.deepEqual(settleFreezes(['2026-03-01', '2026-03-02'], [], '2026-03-03', '2026-03-05', 2).frozen, ['2026-03-03', '2026-03-04']);
});

const base = { today: '2026-03-11', tasks: [], overdueCount: 0, streak: 0, bestStreak: 0, dailyGoal: 3, doneToday: 0, totalCompleted: 0, categories: CATEGORIES };
const t = (date, completed, extra = {}) => ({ date, completed, completedOn: completed ? date : null, completedHour: null, category: 'personal', ...extra });

test('consejos: usuario nuevo recibe bienvenida', () => {
  const { items } = buildInsights(base);
  assert.equal(items[0].id, 'welcome');
});

test('consejos: tareas atrasadas generan alerta primero', () => {
  const { items } = buildInsights({ ...base, overdueCount: 3, totalCompleted: 5, tasks: [t('2026-03-11', false)] });
  assert.equal(items[0].kind, 'alert');
  assert.match(items[0].title, /3 tareas atrasadas/);
});

test('consejos: semana excelente y racha elogian', () => {
  const tasks = [];
  for (let i = 0; i < 6; i++) tasks.push(t(addDays('2026-03-11', -i), true));
  const { items, summary } = buildInsights({ ...base, tasks, streak: 6, doneToday: 1, totalCompleted: 20 });
  const ids = items.map((i) => i.id);
  assert.ok(ids.includes('week_great') && ids.includes('streak_praise'));
  assert.equal(summary.weekRate, 100);
});

test('consejos: semana floja sugiere menos tareas', () => {
  const tasks = [t('2026-03-10', false), t('2026-03-09', false), t('2026-03-08', false), t('2026-03-07', true)];
  const { items } = buildInsights({ ...base, tasks, totalCompleted: 9 });
  assert.ok(items.some((i) => i.id === 'week_low' && i.kind === 'improve'));
});

test('consejos: detecta el día de la semana más difícil', () => {
  // 4 semanas: los lunes nunca se cumple, los demás días sí
  const tasks = [];
  for (let i = 0; i < 28; i++) {
    const date = addDays('2026-03-11', -i);
    for (let k = 0; k < 3; k++) tasks.push(t(date, weekday(date) !== 1 || false));
  }
  const { items } = buildInsights({ ...base, tasks, totalCompleted: 50, streak: 0, doneToday: 3 });
  assert.ok(items.some((i) => i.id === 'weekday_worst' && /lunes/.test(i.title)));
});
