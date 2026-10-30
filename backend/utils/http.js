class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
const bad = (message) => new HttpError(400, message);

// Envuelve handlers async para que los errores lleguen al manejador de errores de Express.
const h = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const clean = (v) => (typeof v === 'string' ? v.trim() : '');
const parseId = (v) => {
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0 || n > 2147483647) throw bad('ID inválido');
  return n;
};

module.exports = { HttpError, bad, h, clean, parseId };
