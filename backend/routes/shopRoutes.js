const express = require('express');
const db = require('../db');
const verifyToken = require('../middleware/auth');
const { h, bad, clean, parseId, HttpError } = require('../utils/http');
const { ITEMS, ITEM_BY_ID, FREEZE } = require('../domain/catalog');
const { getMe, loadSnapshot, evaluateAchievements } = require('../services/progress');

const router = express.Router();
router.use(verifyToken);

router.get('/', h(async (req, res) => {
  const me = await getMe(req.user.id, req.today);
  const owned = new Set(me.inventory);
  res.json({
    coins: me.progress.coins,
    freeze: { ...FREEZE, owned: me.progress.freezes },
    items: ITEMS.map((i) => ({ ...i, owned: owned.has(i.id) })),
  });
}));

router.post('/buy', h(async (req, res) => {
  const { itemId } = req.body;
  const uid = req.user.id;

  await db.tx(async (t) => {
    const user = (await t.query('SELECT coins, streak_freezes FROM users WHERE id = $1 FOR UPDATE', [uid])).rows[0];
    if (itemId === FREEZE.id) {
      if (user.streak_freezes >= FREEZE.max) throw bad(`Solo puedes guardar ${FREEZE.max} escudos`);
      if (user.coins < FREEZE.price) throw bad('No tienes suficientes monedas');
      await t.query('UPDATE users SET coins = coins - $2, streak_freezes = streak_freezes + 1 WHERE id = $1', [uid, FREEZE.price]);
      return;
    }
    const item = ITEM_BY_ID[itemId];
    if (!item) throw new HttpError(404, 'Artículo no encontrado');
    if (item.price === 0) throw bad('Ese artículo ya es tuyo');
    const has = await t.query('SELECT 1 FROM inventory WHERE user_id = $1 AND item_id = $2', [uid, item.id]);
    if (has.rows.length) throw bad('Ya tienes ese artículo');
    if (user.coins < item.price) throw bad('No tienes suficientes monedas');
    await t.query('UPDATE users SET coins = coins - $2 WHERE id = $1', [uid, item.price]);
    await t.query('INSERT INTO inventory (user_id, item_id) VALUES ($1, $2)', [uid, item.id]);
  });

  const achievements = await evaluateAchievements(uid, req.today);
  res.status(201).json({ me: await getMe(uid, req.today), achievements });
}));

/* ---------- Premios personalizados: el usuario define un premio real y lo "compra" con sus monedas ---------- */
const mapReward = (r) => ({ id: r.id, title: r.title, emoji: r.emoji, cost: r.cost, timesRedeemed: r.times_redeemed });

router.get('/rewards', h(async (req, res) => {
  const { rows } = await db.query('SELECT * FROM custom_rewards WHERE user_id = $1 ORDER BY cost, id', [req.user.id]);
  res.json(rows.map(mapReward));
}));

router.post('/rewards', h(async (req, res) => {
  const title = clean(req.body.title);
  const emoji = clean(req.body.emoji) || '🎁';
  const cost = req.body.cost;
  if (!title || title.length > 40) throw bad('El premio necesita un nombre (máximo 40 caracteres)');
  if ([...emoji].length > 4) throw bad('Emoji inválido');
  if (!Number.isInteger(cost) || cost < 5 || cost > 1000) throw bad('El costo debe ser entre 5 y 1000 monedas');
  const count = (await db.query('SELECT count(*)::int AS n FROM custom_rewards WHERE user_id = $1', [req.user.id])).rows[0].n;
  if (count >= 20) throw bad('Máximo 20 premios personalizados');
  const { rows } = await db.query('INSERT INTO custom_rewards (user_id, title, emoji, cost) VALUES ($1, $2, $3, $4) RETURNING *', [req.user.id, title, emoji, cost]);
  res.status(201).json(mapReward(rows[0]));
}));

router.delete('/rewards/:id', h(async (req, res) => {
  const r = await db.query('DELETE FROM custom_rewards WHERE id = $1 AND user_id = $2', [parseId(req.params.id), req.user.id]);
  if (!r.rowCount && !r.affectedRows) throw new HttpError(404, 'Premio no encontrado');
  res.json({ message: 'Premio eliminado' });
}));

router.post('/rewards/:id/redeem', h(async (req, res) => {
  const id = parseId(req.params.id);
  await db.tx(async (t) => {
    const reward = (await t.query('SELECT * FROM custom_rewards WHERE id = $1 AND user_id = $2 FOR UPDATE', [id, req.user.id])).rows[0];
    if (!reward) throw new HttpError(404, 'Premio no encontrado');
    const paid = await t.query('UPDATE users SET coins = coins - $2 WHERE id = $1 AND coins >= $2 RETURNING coins', [req.user.id, reward.cost]);
    if (!paid.rows.length) throw bad('No tienes suficientes monedas');
    await t.query('UPDATE custom_rewards SET times_redeemed = times_redeemed + 1 WHERE id = $1', [id]);
  });
  res.json({ me: await getMe(req.user.id, req.today) });
}));

module.exports = router;
