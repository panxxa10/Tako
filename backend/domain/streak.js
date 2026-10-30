const { toNum, fromNum, addDays } = require('../utils/dates');

/**
 * Racha = días consecutivos con al menos una tarea completada.
 * Un "día congelado" (escudo de racha) mantiene viva la racha pero no suma.
 * La racha actual sigue viva hasta el final de hoy: si hoy aún no hay actividad cuenta desde ayer.
 */
function computeStreaks(activeDays, frozenDays, today) {
  const active = new Set(activeDays);
  const frozen = new Set(frozenDays);
  const alive = (k) => active.has(k) || frozen.has(k);

  // Mejor racha: recorre los días vivos ordenados y cuenta solo los activos de cada tramo.
  const all = [...new Set([...active, ...frozen])].map(toNum).sort((a, b) => a - b);
  let best = 0;
  let run = 0;
  let prev = null;
  for (const n of all) {
    run = prev !== null && n === prev + 1 ? run : 0;
    if (active.has(fromNum(n))) run++;
    best = Math.max(best, run);
    prev = n;
  }

  // Racha actual
  let cursor = active.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (alive(cursor)) {
    if (active.has(cursor)) streak++;
    cursor = addDays(cursor, -1);
  }
  return { streak, bestStreak: Math.max(best, streak) };
}

/**
 * Decide qué días perdidos se salvan con escudos. Recorre desde `fromDay` hasta ayer:
 * un día sin actividad se congela solo si justo antes había racha viva y quedan escudos.
 * Devuelve { frozen: [días], freezesLeft }.
 */
function settleFreezes(activeDays, frozenDays, fromDay, today, freezes) {
  const active = new Set(activeDays);
  const frozen = new Set(frozenDays);
  const alive = (k) => active.has(k) || frozen.has(k);
  const newlyFrozen = [];
  let left = freezes;
  for (let d = fromDay; d < today; d = addDays(d, 1)) {
    if (alive(d)) continue;
    if (left > 0 && alive(addDays(d, -1))) {
      frozen.add(d);
      newlyFrozen.push(d);
      left--;
    }
  }
  return { frozen: newlyFrozen, freezesLeft: left };
}

module.exports = { computeStreaks, settleFreezes };
