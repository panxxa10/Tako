const express = require('express');
const db = require('../db');
const verifyToken = require('../middleware/auth');
const { h, bad } = require('../utils/http');
const { REWARDS } = require('../domain/catalog');
const { getMe, evaluateAchievements } = require('../services/progress');

const router = express.Router();
router.use(verifyToken);

// Registra una sesión de enfoque terminada (tipo Pomodoro). Da una pequeña recompensa, con tope diario.
router.post('/', h(async (req, res) => {
  const minutes = req.body.minutes;
  if (!Number.isInteger(minutes) || minutes < 1 || minutes > 180) throw bad('Duración inválida');
  const uid = req.user.id;
  const rewards = { xp: 0, coins: 0, capped: false };

  await db.tx(async (t) => {
    await t.query('SELECT id FROM users WHERE id = $1 FOR UPDATE', [uid]);
    const { n } = (await t.query('SELECT count(*)::int AS n FROM focus_sessions WHERE user_id = $1 AND day = $2 AND rewarded', [uid, req.today])).rows[0];
    const eligible = minutes >= REWARDS.focus.minMinutes && n < REWARDS.focus.maxPerDay;
    rewards.capped = minutes >= REWARDS.focus.minMinutes && !eligible;
    await t.query('INSERT INTO focus_sessions (user_id, minutes, day, rewarded) VALUES ($1, $2, $3, $4)', [uid, minutes, req.today, eligible]);
    if (eligible) {
      rewards.xp = REWARDS.focus.xp;
      rewards.coins = REWARDS.focus.coins;
      await t.query('UPDATE users SET xp = xp + $2, coins = coins + $3 WHERE id = $1', [uid, rewards.xp, rewards.coins]);
    }
  });

  const achievements = await evaluateAchievements(uid, req.today);
  res.status(201).json({ rewards, achievements, me: await getMe(uid, req.today) });
}));

module.exports = router;
