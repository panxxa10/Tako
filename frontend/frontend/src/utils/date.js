const pad = (n) => String(n).padStart(2, '0');

// Fecha local -> "YYYY-MM-DD" (sin pasar por UTC: después de las 7 pm en Colombia UTC ya es "mañana").
export const toDateKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
export const todayKey = () => toDateKey(new Date());

export const monthRange = (year, month) => {
  const last = new Date(year, month + 1, 0).getDate();
  return { from: `${year}-${pad(month + 1)}-01`, to: `${year}-${pad(month + 1)}-${pad(last)}` };
};

export const parseKey = (key) => { const [y, m, d] = key.split('-').map(Number); return new Date(y, m - 1, d); };
export const addDaysKey = (key, n) => { const d = parseKey(key); d.setDate(d.getDate() + n); return toDateKey(d); };

export const formatLong = (key) => parseKey(key).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
export const formatShort = (key) => parseKey(key).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
export const weekdayShort = (key) => ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][parseKey(key).getDay()];
export const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
