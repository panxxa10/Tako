const express = require('express');
const crypto = require('crypto');
const db = require('../db');
const verifyToken = require('../middleware/auth');
const { h, bad, clean, parseId, HttpError } = require('../utils/http');
const { isKey, addDays, diffDays, weekday } = require('../utils/dates');
const { CATEGORY_IDS, REWARDS } = require('../domain/catalog');
const { levelFromXp } = require('../domain/levels');
const { getMe, evaluateAchievements } = require('../services/progress');

const router = express.Router();
router.use(verifyToken);

const COLUMNS = 'id, title, notes, date, category, completed, completed_on, series_id, created_at';
const map = (r) => ({
  id: r.id, title: r.title, notes: r.notes, date: r.date, category: r.category,
  completed: r.completed, completedOn: r.completed_on, seriesId: r.series_id, createdAt: r.created_at,
});

function occurrences(start, repeat) {
  if (repeat === 'daily') return Array.from({ length: 28 }, (_, i) => addDays(start, i));
  if (repeat === 'weekly') return Array.from({ length: 8 }, (_, i) => addDays(start, i * 7));
  if (repeat === 'weekdays') {
    const out = [];
    for (let i = 0; out.length < 20 && i < 40; i++) {
      const d = addDays(start, i);
      if (weekday(d) % 6 !== 0) out.push(d);
    }
    return out;
  }
  return [start];
}

router.post('/', h(async (req, res) => {
  const title = clean(req.body.title);
  const notes = clean(req.body.notes);
  const category = req.body.category || 'personal';
  const repeat = req.body.repeat || 'none';
  if (!title) throw bad('El título es obligatorio');
  if (title.length > 200) throw bad('El título no puede superar 200 caracteres');
  if (notes.length > 1000) throw bad('Las notas no pueden superar 1000 caracteres');
  if (!isKey(req.body.date)) throw bad('Fecha inválida (usa YYYY-MM-DD)');
  if (!CATEGORY_IDS.includes(category)) throw bad('Categoría inválida');
  if (!['none', 'daily', 'weekdays', 'weekly'].includes(repeat)) throw bad('Repetición inválida');

  const dates = occurrences(req.body.date, repeat);
  const seriesId = dates.length > 1 ? crypto.randomUUID() : null;
  const created = await db.tx(async (t) => {
    const out = [];
    for (const date of dates) {
      const { rows } = await t.query(
        `INSERT INTO tasks (user_id, title, notes, date, category, series_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING ${COLUMNS}`,
        [req.user.id, title, notes, date, category, seriesId]);
      out.push(rows[0]);
    }
    return out;
  });
  res.status(201).json({ task: map(created[0]), created: created.length });
}));

// Tareas de un rango de fechas (el calendario carga el mes completo)
router.get('/', h(async (req, res) => {
  const { from, to } = req.query;
  if (!isKey(from) || !isKey(to) || diffDays(to, from) < 0 || diffDays(to, from) > 100) throw bad('Parámetros from/to inválidos (usa YYYY-MM-DD, máximo 100 días)');
  const { rows } = await db.query(
    `SELECT ${COLUMNS} FROM tasks WHERE user_id = $1 AND deleted_at IS NULL AND date BETWEEN $2 AND $3 ORDER BY date, created_at, id`,
    [req.user.id, from, to]);
  res.json(rows.map(map));
}));

// Tareas atrasadas (días anteriores a hoy sin completar)
router.get('/overdue', h(async (req, res) => {
  const { rows } = await db.query(
    `SELECT ${COLUMNS} FROM tasks WHERE user_id = $1 AND deleted_at IS NULL AND NOT completed AND date < $2 AND date >= $3 ORDER BY date, id LIMIT 100`,
    [req.user.id, req.today, addDays(req.today, -90)]);
  res.json(rows.map(map));
}));

// Pasar tareas a otra fecha (por defecto: todas las atrasadas a hoy)
router.post('/reschedule', h(async (req, res) => {
  const to = req.body.to || req.today;
  if (!isKey(to)) throw bad('Fecha inválida');
  const ids = Array.isArray(req.body.ids) ? req.body.ids.map(parseId) : null;
  const { rows } = ids
    ? await db.query('UPDATE tasks SET date = $2 WHERE user_id = $1 AND id = ANY($3::int[]) AND NOT completed AND deleted_at IS NULL RETURNING id', [req.user.id, to, ids])
    : await db.query('UPDATE tasks SET date = $2 WHERE user_id = $1 AND NOT completed AND deleted_at IS NULL AND date < $2 AND date >= $3 RETURNING id', [req.user.id, to, addDays(to, -90)]);
  res.json({ moved: rows.length });
}));

router.patch('/:id', h(async (req, res) => {
  const id = parseId(req.params.id);
  const sets = [];
  const params = [id, req.user.id];
  const add = (col, val) => { params.push(val); sets.push(`${col} = $${params.length}`); };
  if (req.body.title !== undefined) {
    const v = clean(req.body.title);
    if (!v || v.length > 200) throw bad('Título inválido (1-200 caracteres)');
    add('title', v);
  }
  if (req.body.notes !== undefined) {
    const v = clean(req.body.notes);
    if (v.length > 1000) throw bad('Notas demasiado largas');
    add('notes', v);
  }
  if (req.body.category !== undefined) {
    if (!CATEGORY_IDS.includes(req.body.category)) throw bad('Categoría inválida');
    add('category', req.body.category);
  }
  if (req.body.date !== undefined) {
    if (!isKey(req.body.date)) throw bad('Fecha inválida');
    add('date', req.body.date);
  }
  if (!sets.length) throw bad('Nada que actualizar');
  const { rows } = await db.query(
    `UPDATE tasks SET ${sets.join(', ')} WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL RETURNING ${COLUMNS}`, params);
  if (!rows[0]) throw new HttpError(404, 'Tarea no encontrada');
  res.json(map(rows[0]));
}));

// Marcar / desmarcar. Al completar por primera vez da XP y monedas (y bono si se cumple la meta diaria).
router.post('/:id/toggle', h(async (req, res) => {
  const id = parseId(req.params.id);
  const uid = req.user.id;
  const { today, hour } = req;

  const outcome = await db.tx(async (t) => {
    const task = (await t.query('SELECT * FROM tasks WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL FOR UPDATE', [id, uid])).rows[0];
    if (!task) return null;
    const rewards = { xp: 0, coins: 0, goalReached: false, capped: false, levelUp: null };

    if (task.completed) {
      await t.query('UPDATE tasks SET completed = FALSE, completed_at = NULL, completed_on = NULL, completed_hour = NULL WHERE id = $1', [id]);
    } else {
      const user = (await t.query('SELECT xp, daily_goal FROM users WHERE id = $1 FOR UPDATE', [uid])).rows[0];
      let claimed = task.reward_claimed;
      let xp = 0;
      let coins = 0;
      if (!claimed) {
        const { n } = (await t.query('SELECT count(*)::int AS n FROM tasks WHERE user_id = $1 AND reward_claimed AND completed_on = $2', [uid, today])).rows[0];
        if (n < REWARDS.dailyTaskCap) { claimed = true; xp += REWARDS.task.xp; coins += REWARDS.task.coins; } else rewards.capped = true;
      }
      await t.query(
        'UPDATE tasks SET completed = TRUE, completed_at = now(), completed_on = $2, completed_hour = $3, reward_claimed = $4 WHERE id = $1',
        [id, today, hour, claimed]);

      const doneToday = (await t.query('SELECT count(*)::int AS n FROM tasks WHERE user_id = $1 AND completed_on = $2', [uid, today])).rows[0].n;
      if (doneToday >= user.daily_goal) {
        const ins = await t.query('INSERT INTO goal_claims (user_id, day) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING day', [uid, today]);
        if (ins.rows.length) { rewards.goalReached = true; xp += REWARDS.goal.xp; coins += REWARDS.goal.coins; }
      }
      if (xp || coins) {
        const newlyClaimed = claimed && !task.reward_claimed ? 1 : 0;
        await t.query('UPDATE users SET xp = xp + $2, coins = coins + $3, total_completed = total_completed + $4 WHERE id = $1', [uid, xp, coins, newlyClaimed]);
        const before = levelFromXp(user.xp).level;
        const after = levelFromXp(user.xp + xp).level;
        if (after > before) rewards.levelUp = { from: before, to: after };
      }
      rewards.xp = xp;
      rewards.coins = coins;
    }
    const updated = (await t.query(`SELECT ${COLUMNS} FROM tasks WHERE id = $1`, [id])).rows[0];
    return { task: map(updated), rewards };
  });

  if (!outcome) throw new HttpError(404, 'Tarea no encontrada');
  const achievements = outcome.task.completed ? await evaluateAchievements(uid, today) : [];
  res.json({ ...outcome, achievements, me: await getMe(uid, today) });
}));

// Borrado suave: la tarea desaparece pero su XP, monedas y racha se conservan.
router.delete('/:id', h(async (req, res) => {
  const id = parseId(req.params.id);
  const { rows } = await db.query('SELECT series_id, date FROM tasks WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL', [id, req.user.id]);
  if (!rows[0]) throw new HttpError(404, 'Tarea no encontrada');
  if (req.query.series === '1' && rows[0].series_id) {
    const r = await db.query(
      'UPDATE tasks SET deleted_at = now() WHERE user_id = $1 AND series_id = $2 AND date >= $3 AND NOT completed AND deleted_at IS NULL RETURNING id',
      [req.user.id, rows[0].series_id, rows[0].date]);
    return res.json({ message: 'Serie eliminada', deleted: r.rows.length });
  }
  await db.query('UPDATE tasks SET deleted_at = now() WHERE id = $1', [id]);
  res.json({ message: 'Tarea eliminada correctamente', deleted: 1 });
}));

module.exports = router;
