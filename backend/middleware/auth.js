const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');

const verifyToken = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ message: 'No autorizado' });
  try {
    const decoded = jwt.verify(header.split(' ')[1], jwtSecret);
    req.user = { id: decoded.id };
    next();
  } catch {
    res.status(401).json({ message: 'Sesión expirada o token inválido' });
  }
};

module.exports = verifyToken;
