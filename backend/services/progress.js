const db = require('../db');
const { REWARDS, FREEZE, ITEMS, DEFAULT_PET } = require('../domain/catalog');
const { levelFromXp } = require('../domain/levels');
const { computeStreaks, settleFreezes } = require('../domain/streak');
const { ACHIEVEMENTS } = require('../domain/achievements');
const { addDays } = require('../utils/dates');

const FREE_ITEM_IDS = ITEMS.filter((i) => i.price === 0).map((i) => i.id);

/** Congela (con escudos) los días perdidos que habrían roto una racha. Se ejecuta al abrir la app. */
async function settle(q, userId, today) {
  const yesterday = addDays(today, -1);
  const u = (await q.query('SELECT streak_freezes, last_settled FROM users WHERE id = $1', [userId])).rows[0];
  if (!u || (u.last_settled && u.last_settled >= yesterday)) return;

  const active = (await q.query('SELECT DISTINCT completed_on AS d FROM tasks WHERE user_id = $1 AND completed_on IS NOT NULL', [userId])).rows.map((r) => r.d);
  if (!active.length) {
    await q.query('UPDATE users SET last_settled = $2 WHERE id = $1', [userId, yesterday]);
    return;
  }
  const frozen = (await q.query('SELECT day AS d FROM frozen_days WHERE user_id = $1', [userId])).rows.map((r) => r.d);
  const from = u.last_settled ? addDays(u.last_settled, 1) : [...active].sort()[0];
  const result = settleFreezes(active, frozen, from, today, u.streak_freezes);
  for (const day of result.frozen) {
    await q.query('INSERT INTO frozen_days (user_id, day) VALUES ($1, $2) ON CONFLICT DO NOTHING', [userId, day]);
  }
  await q.query('UPDATE users SET streak_freezes = $2, last_settled = $3 WHERE id = $1', [userId, result.freezesLeft, yesterday]);
}

async function loadSnapshot(q, userId, today) {
  const u = (await q.query('SELECT * FROM users WHERE id = $1', [userId])).rows[0];
  if (!u) return null;
  const [active, frozen, inv, done, claimed] = await Promise.all([
    q.query('SELECT DISTINCT completed_on AS d FROM tasks WHERE user_id = $1 AND completed_on IS NOT NULL', [userId]),
    q.query('SELECT day AS d FROM frozen_days WHERE user_id = $1', [userId]),
    q.query('SELECT item_id FROM inventory WHERE user_id = $1', [userId]),
    q.query('SELECT count(*)::int AS n FROM tasks WHERE user_id = $1 AND completed_on = $2', [userId, today]),
    q.query('SELECT count(*)::int AS n FROM tasks WHERE user_id = $1 AND reward_claimed AND completed_on = $2', [userId, today]),
  ]);
  const streaks = computeStreaks(active.rows.map((r) => r.d), frozen.rows.map((r) => r.d), today);
  return {
    user: u,
    streaks,
    doneToday: done.rows[0].n,
    rewardsToday: claimed.rows[0].n,
    owned: [...FREE_ITEM_IDS, ...inv.rows.map((r) => r.item_id)],
    purchased: inv.rows.length,
  };
}

const buildMe = (s) => {
  const u = s.user;
  const lvl = levelFromXp(u.xp);
  return {
    user: {
      id: u.id, username: u.username, email: u.email, occupation: u.occupation,
      dailyGoal: u.daily_goal, theme: u.theme, onboarded: u.onboarded, createdAt: u.created_at,
    },
    pet: { ...DEFAULT_PET, ...u.pet },
    progress: {
      xp: u.xp, ...lvl, coins: u.coins,
      freezes: u.streak_freezes, freezeMax: FREEZE.max,
      streak: s.streaks.streak, bestStreak: s.streaks.bestStreak,
      doneToday: s.doneToday, dailyGoal: u.daily_goal, goalReached: s.doneToday >= u.daily_goal,
      streakAtRisk: s.streaks.streak > 0 && s.doneToday === 0,
      rewardsToday: s.rewardsToday, rewardsCap: REWARDS.dailyTaskCap,
      totalCompleted: u.total_completed,
    },
    inventory: s.owned,
  };
};

async function getMe(userId, today, q = db) {
  await settle(q, userId, today);
  const snap = await loadSnapshot(q, userId, today);
  return snap ? buildMe(snap) : null;
}

async function computeMetrics(q, userId, snap) {
  const [goal, perfect, focus] = await Promise.all([
    q.query('SELECT count(*)::int AS n FROM goal_claims WHERE user_id = $1', [userId]),
    q.query(`SELECT count(*)::int AS n FROM (
               SELECT date FROM tasks WHERE user_id = $1 AND deleted_at IS NULL
               GROUP BY date HAVING count(*) >= 3 AND count(*) = count(*) FILTER (WHERE completed)) p`, [userId]),
    q.query('SELECT count(*)::int AS n FROM focus_sessions WHERE user_id = $1 AND rewarded', [userId]),
  ]);
  const pet = snap.user.pet || {};
  return {
    totalCompleted: snap.user.total_completed,
    bestStreak: snap.streaks.bestStreak,
    level: levelFromXp(snap.user.xp).level,
    goalDays: goal.rows[0].n,
    perfectDays: perfect.rows[0].n,
    itemsOwned: snap.purchased,
    equippedSlots: ['hat', 'glasses', 'neck'].filter((k) => pet[k]).length,
    focusSessions: focus.rows[0].n,
  };
}

/** Desbloquea (y premia con monedas) los logros que ya se cumplieron. Devuelve los nuevos. */
async function evaluateAchievements(userId, today, q = db) {
  const snap = await loadSnapshot(q, userId, today);
  if (!snap) return [];
  const metrics = await computeMetrics(q, userId, snap);
  const have = new Set((await q.query('SELECT achievement_id FROM achievements WHERE user_id = $1', [userId])).rows.map((r) => r.achievement_id));
  const unlocked = [];
  let coins = 0;
  for (const a of ACHIEVEMENTS) {
    if (have.has(a.id) || metrics[a.metric] < a.target) continue;
    const ins = await q.query('INSERT INTO achievements (user_id, achievement_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING achievement_id', [userId, a.id]);
    if (ins.rows.length) { coins += a.coins; unlocked.push(a); }
  }
  if (coins) await q.query('UPDATE users SET coins = coins + $2 WHERE id = $1', [userId, coins]);
  return unlocked;
}

async function listAchievements(userId, today, q = db) {
  await settle(q, userId, today);
  const snap = await loadSnapshot(q, userId, today);
  const metrics = await computeMetrics(q, userId, snap);
  const rows = (await q.query('SELECT achievement_id, unlocked_at FROM achievements WHERE user_id = $1', [userId])).rows;
  const at = Object.fromEntries(rows.map((r) => [r.achievement_id, r.unlocked_at]));
  return ACHIEVEMENTS.map((a) => ({
    ...a,
    current: Math.min(metrics[a.metric], a.target),
    unlocked: Boolean(at[a.id]),
    unlockedAt: at[a.id] || null,
  }));
}

module.exports = { settle, getMe, loadSnapshot, buildMe, evaluateAchievements, listAchievements };
