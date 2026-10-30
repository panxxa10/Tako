const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { jwtSecret } = require('../config/env');
const verifyToken = require('../middleware/auth');
const { h, bad, clean, HttpError } = require('../utils/http');

const router = express.Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const sign = (id) => jwt.sign({ id }, jwtSecret, { expiresIn: '30d' });

router.post('/register', h(async (req, res) => {
  const username = clean(req.body.username);
  const email = clean(req.body.email).toLowerCase();
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  if (username.length < 3 || username.length > 30) throw bad('El nombre de usuario debe tener entre 3 y 30 caracteres');
  if (!EMAIL_RE.test(email) || email.length > 120) throw bad('Correo electrónico inválido');
  if (password.length < 8 || password.length > 100) throw bad('La contraseña debe tener al menos 8 caracteres');

  const hash = await bcrypt.hash(password, 10);
  try {
    const { rows } = await db.query(
      'INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3) RETURNING id', [email, username, hash]);
    res.status(201).json({ token: sign(rows[0].id) });
  } catch (err) {
    if (err.code === '23505') {
      const isEmail = /email/i.test(`${err.constraint || ''} ${err.detail || ''} ${err.message || ''}`);
      throw new HttpError(409, isEmail ? 'Ese correo ya está registrado' : 'Ese nombre de usuario ya está en uso');
    }
    throw err;
  }
}));

router.post('/login', h(async (req, res) => {
  const email = clean(req.body.email).toLowerCase();
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  const { rows } = email ? await db.query('SELECT id, password_hash FROM users WHERE lower(email) = $1', [email]) : { rows: [] };
  // Mismo mensaje si el correo no existe o la contraseña es incorrecta (no revela qué correos están registrados).
  const ok = rows[0] ? await bcrypt.compare(password, rows[0].password_hash) : false;
  if (!ok) throw new HttpError(401, 'Correo o contraseña incorrectos');
  res.json({ token: sign(rows[0].id) });
}));

router.post('/password', verifyToken, h(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (typeof newPassword !== 'string' || newPassword.length < 8 || newPassword.length > 100) throw bad('La nueva contraseña debe tener al menos 8 caracteres');
  const { rows } = await db.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
  if (!rows[0] || !(await bcrypt.compare(String(currentPassword || ''), rows[0].password_hash))) throw new HttpError(401, 'La contraseña actual no es correcta');
  await db.query('UPDATE users SET password_hash = $2 WHERE id = $1', [req.user.id, await bcrypt.hash(newPassword, 10)]);
  res.json({ message: 'Contraseña actualizada' });
}));

// Eliminar la cuenta y todos sus datos
router.delete('/me', verifyToken, h(async (req, res) => {
  const { rows } = await db.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
  if (!rows[0] || !(await bcrypt.compare(String(req.body.password || ''), rows[0].password_hash))) throw new HttpError(401, 'La contraseña no es correcta');
  await db.query('DELETE FROM users WHERE id = $1', [req.user.id]);
  res.json({ message: 'Cuenta eliminada' });
}));

module.exports = router;
