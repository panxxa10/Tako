// Todas las fechas "de calendario" viajan como texto YYYY-MM-DD, sin zonas horarias.
const DAY_MS = 86400000;

const isKey = (s) =>
  typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && new Date(`${s}T00:00:00Z`).toISOString().slice(0, 10) === s;

const toNum = (key) => Math.round(Date.parse(`${key}T00:00:00Z`) / DAY_MS);
const fromNum = (n) => new Date(n * DAY_MS).toISOString().slice(0, 10);
const addDays = (key, n) => fromNum(toNum(key) + n);
const diffDays = (a, b) => toNum(a) - toNum(b);
const weekday = (key) => new Date(`${key}T00:00:00Z`).getUTCDay(); // 0 = domingo
const utcToday = () => new Date().toISOString().slice(0, 10);

module.exports = { isKey, toNum, fromNum, addDays, diffDays, weekday, utcToday };
