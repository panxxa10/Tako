const express = require('express');
const db = require('../db');
const verifyToken = require('../middleware/auth');
const { h, bad, clean, HttpError } = require('../utils/http');
const { SLOTS, ITEM_BY_ID, DEFAULT_PET } = require('../domain/catalog');
const { getMe, loadSnapshot, evaluateAchievements, listAchievements } = require('../services/progress');

const router = express.Router();
router.use(verifyToken);

router.get('/', h(async (req, res) => {
  const me = await getMe(req.user.id, req.today);
  if (!me) throw new HttpError(401, 'Sesión inválida');
  res.json(me);
}));

router.patch('/', h(async (req, res) => {
  const { username, occupation, dailyGoal, theme, onboarded } = req.body;
  const sets = [];
  const params = [req.user.id];
  const add = (col, val) => { params.push(val); sets.push(`${col} = $${params.length}`); };

  if (username !== undefined) {
    const v = clean(username);
    if (v.length < 3 || v.length > 30) throw bad('El nombre de usuario debe tener entre 3 y 30 caracteres');
    add('username', v);
  }
  if (occupation !== undefined) {
    const v = clean(occupation);
    if (v.length > 60) throw bad('La ocupación no puede superar 60 caracteres');
    add('occupation', v);
  }
  if (dailyGoal !== undefined) {
    if (!Number.isInteger(dailyGoal) || dailyGoal < 1 || dailyGoal > 10) throw bad('La meta diaria debe ser entre 1 y 10 tareas');
    add('daily_goal', dailyGoal);
  }
  if (theme !== undefined) {
    if (!['auto', 'light', 'dark'].includes(theme)) throw bad('Tema inválido');
    add('theme', theme);
  }
  if (onboarded !== undefined) add('onboarded', Boolean(onboarded));
  if (!sets.length) throw bad('Nada que actualizar');

  try {
    await db.query(`UPDATE users SET ${sets.join(', ')} WHERE id = $1`, params);
  } catch (err) {
    if (err.code === '23505') throw new HttpError(409, 'Ese nombre de usuario ya está en uso');
    throw err;
  }
  res.json(await getMe(req.user.id, req.today));
}));

// Personalizar a Tako: nombre y artículos equipados (solo los que el usuario tiene)
router.put('/pet', h(async (req, res) => {
  const snap = await loadSnapshot(db, req.user.id, req.today);
  const pet = { ...DEFAULT_PET, ...snap.user.pet };
  const input = req.body || {};

  if ('name' in input) {
    const name = clean(input.name);
    if (name.length < 1 || name.length > 20) throw bad('El nombre de tu mascota debe tener entre 1 y 20 caracteres');
    pet.name = name;
  }
  for (const slot of SLOTS) {
    if (!(slot in input)) continue;
    const value = input[slot];
    if (value === null && ['hat', 'glasses', 'neck'].includes(slot)) { pet[slot] = null; continue; }
    const item = ITEM_BY_ID[value];
    if (!item || item.slot !== slot) throw bad(`Artículo inválido para ${slot}`);
    if (!snap.owned.includes(item.id)) throw new HttpError(403, 'Todavía no tienes ese artículo');
    pet[slot] = item.id;
  }
  await db.query('UPDATE users SET pet = $2::jsonb WHERE id = $1', [req.user.id, JSON.stringify(pet)]);
  const achievements = await evaluateAchievements(req.user.id, req.today);
  res.json({ me: await getMe(req.user.id, req.today), achievements });
}));

router.get('/achievements', h(async (req, res) => {
  res.json(await listAchievements(req.user.id, req.today));
}));

module.exports = router;
