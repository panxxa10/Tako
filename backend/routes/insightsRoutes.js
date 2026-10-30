const express = require('express');
const db = require('../db');
const verifyToken = require('../middleware/auth');
const { h, HttpError } = require('../utils/http');
const { addDays } = require('../utils/dates');
const { CATEGORIES } = require('../domain/catalog');
const { buildInsights } = require('../domain/insights');
const { getMe } = require('../services/progress');

const router = express.Router();
router.use(verifyToken);

// Consejos personalizados + datos para las gráficas de progreso
router.get('/', h(async (req, res) => {
  const uid = req.user.id;
  const today = req.today;
  const me = await getMe(uid, today);
  if (!me) throw new HttpError(401, 'Sesión inválida');
  const from = addDays(today, -27);

  const [tasks, overdue, activity, planned] = await Promise.all([
    db.query(
      'SELECT date, completed, completed_on, completed_hour, category FROM tasks WHERE user_id = $1 AND deleted_at IS NULL AND date BETWEEN $2 AND $3',
      [uid, from, today]),
    db.query('SELECT count(*)::int AS n FROM tasks WHERE user_id = $1 AND deleted_at IS NULL AND NOT completed AND date < $2 AND date >= $3', [uid, today, addDays(today, -90)]),
    db.query('SELECT completed_on AS d, count(*)::int AS n FROM tasks WHERE user_id = $1 AND completed_on BETWEEN $2 AND $3 GROUP BY completed_on', [uid, from, today]),
    db.query('SELECT date AS d, count(*)::int AS n FROM tasks WHERE user_id = $1 AND deleted_at IS NULL AND date BETWEEN $2 AND $3 GROUP BY date', [uid, from, today]),
  ]);

  const result = buildInsights({
    today,
    tasks: tasks.rows.map((r) => ({ date: r.date, completed: r.completed, completedOn: r.completed_on, completedHour: r.completed_hour, category: r.category })),
    overdueCount: overdue.rows[0].n,
    streak: me.progress.streak,
    bestStreak: me.progress.bestStreak,
    dailyGoal: me.progress.dailyGoal,
    doneToday: me.progress.doneToday,
    totalCompleted: me.progress.totalCompleted,
    categories: CATEGORIES,
  });

  const done = Object.fromEntries(activity.rows.map((r) => [r.d, r.n]));
  const plan = Object.fromEntries(planned.rows.map((r) => [r.d, r.n]));
  const days = Array.from({ length: 28 }, (_, i) => {
    const date = addDays(from, i);
    return { date, done: done[date] || 0, planned: plan[date] || 0 };
  });

  res.json({ ...result, days });
}));

module.exports = router;
