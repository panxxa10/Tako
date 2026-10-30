const { addDays, weekday } = require('../utils/dates');

const DAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const pct = (n, d) => (d ? Math.round((n / d) * 100) : 0);

/**
 * Genera consejos personalizados a partir del historial reciente. Es una función pura (sin base de datos), fácil de probar.
 * tasks: tareas de los últimos 28 días (date, completed, completedOn, completedHour, category), sin borradas.
 * Cada consejo: { id, kind: praise | improve | tip | alert, icon, title, body, action? }
 */
function buildInsights({ today, tasks, overdueCount, streak, bestStreak, dailyGoal, doneToday, totalCompleted, categories }) {
  const items = [];
  const push = (i) => items.push(i);
  const catName = (id) => categories.find((c) => c.id === id)?.name || id;

  const weekStart = addDays(today, -6);
  const prevStart = addDays(today, -13);
  const inRange = (t, from, to) => t.date >= from && t.date <= to;
  const week = tasks.filter((t) => inRange(t, weekStart, today));
  const prevWeek = tasks.filter((t) => inRange(t, prevStart, addDays(today, -7)));
  const weekDone = week.filter((t) => t.completed).length;
  const weekRate = pct(weekDone, week.length);
  const prevRate = pct(prevWeek.filter((t) => t.completed).length, prevWeek.length);
  const planned = tasks.filter((t) => t.date <= today); // lo que ya "debía" hacerse

  const plannedToday = tasks.filter((t) => t.date === today).length;

  // ── Estado de hoy
  if (totalCompleted === 0 && tasks.length === 0) {
    push({ id: 'welcome', kind: 'tip', icon: '🌱', title: '¡Empecemos con algo pequeño!', body: 'Crea una sola tarea fácil para hoy. Lo importante es empezar: yo te acompaño paso a paso.', action: { label: 'Crear mi primera tarea', to: '/hoy' } });
  } else if (plannedToday === 0) {
    push({ id: 'plan_today', kind: 'tip', icon: '📝', title: 'Hoy no tienes tareas planeadas', body: 'Elige 2 o 3 tareas pequeñas para hoy. Un plan corto es más fácil de cumplir que uno enorme.', action: { label: 'Planear mi día', to: '/hoy' } });
  }

  if (doneToday >= dailyGoal) {
    push({ id: 'goal_done', kind: 'praise', icon: '🎯', title: '¡Meta de hoy cumplida!', body: `Ya completaste tus ${dailyGoal} tareas del día. Descansa o adelanta algo de mañana, tú decides.` });
  } else if (doneToday > 0) {
    const left = dailyGoal - doneToday;
    push({ id: 'goal_close', kind: 'tip', icon: '🏁', title: `Te ${left === 1 ? 'falta 1 tarea' : `faltan ${left} tareas`} para tu meta`, body: 'Vas muy bien. Termina lo más fácil primero para tomar impulso.' });
  }

  // ── Atrasadas
  if (overdueCount > 0) {
    push({ id: 'overdue', kind: 'alert', icon: '⏰', title: `${overdueCount} ${overdueCount === 1 ? 'tarea atrasada' : 'tareas atrasadas'}`, body: 'No pasa nada, a todos nos pasa. Pásalas a hoy o elimina las que ya no importen y sigue con calma.', action: { label: 'Ver atrasadas', to: '/hoy' } });
  }

  // ── Racha
  if (streak >= 3) {
    push({ id: 'streak_praise', kind: 'praise', icon: '🔥', title: `¡${streak} días seguidos!`, body: doneToday > 0 ? 'Hoy ya sumaste a tu racha. Así se construyen los hábitos: un día a la vez.' : 'Completa una tarea hoy para mantenerla encendida.' });
  } else if (streak > 0 && doneToday === 0) {
    push({ id: 'streak_save', kind: 'tip', icon: '🔥', title: `Protege tu racha de ${streak} ${streak === 1 ? 'día' : 'días'}`, body: 'Con completar una sola tarea hoy tu racha sigue viva.' });
  } else if (streak === 0 && bestStreak >= 3) {
    push({ id: 'streak_restart', kind: 'improve', icon: '🌅', title: 'Tu racha se reinició, ¡y no pasa nada!', body: `Tu mejor racha fue de ${bestStreak} días, así que sabes que puedes. Una tarea hoy y vuelves a empezar.` });
  }

  // ── Rendimiento semanal
  if (week.length >= 3) {
    if (weekRate >= 80) push({ id: 'week_great', kind: 'praise', icon: '🌟', title: `Semana excelente: ${weekRate}% cumplido`, body: 'Estás cumpliendo casi todo lo que planeas. ¡Sigue exactamente así!' });
    else if (weekRate >= 50) push({ id: 'week_ok', kind: 'tip', icon: '📈', title: `Vas por buen camino: ${weekRate}%`, body: 'Cumples más de la mitad de tus tareas. Prueba dividir las tareas grandes en pasos pequeños para subir el ritmo.' });
    else push({ id: 'week_low', kind: 'improve', icon: '🧩', title: `Esta semana cumpliste ${weekRate}%`, body: 'Quizá estás planeando demasiado. Prueba con menos tareas al día y más fáciles: es mejor cumplir poco que dejar mucho a medias.' });
  }
  if (prevWeek.length >= 3 && week.length >= 3) {
    if (weekRate - prevRate >= 10) push({ id: 'trend_up', kind: 'praise', icon: '🚀', title: `¡Subiste ${weekRate - prevRate} puntos!`, body: `La semana pasada cumpliste ${prevRate}% y esta ${weekRate}%. Lo que estás haciendo funciona.` });
    else if (prevRate - weekRate >= 15) push({ id: 'trend_down', kind: 'improve', icon: '🌧️', title: 'Esta semana te costó un poco más', body: `Bajaste de ${prevRate}% a ${weekRate}%. Revisa si estás cansado o con demasiadas tareas y ajusta el plan.` });
  }

  // ── Día de la semana
  const byDay = {};
  for (const t of planned) {
    const d = weekday(t.date);
    byDay[d] ||= { total: 0, done: 0 };
    byDay[d].total++;
    if (t.completed) byDay[d].done++;
  }
  const dayStats = Object.entries(byDay).filter(([, v]) => v.total >= 3).map(([d, v]) => ({ d: Number(d), rate: pct(v.done, v.total), total: v.total }));
  if (dayStats.length >= 3) {
    const worst = [...dayStats].sort((a, b) => a.rate - b.rate)[0];
    const best = [...dayStats].sort((a, b) => b.rate - a.rate)[0];
    if (worst.rate <= 50 && best.rate - worst.rate >= 25) {
      push({ id: 'weekday_worst', kind: 'improve', icon: '📅', title: `Los ${DAYS[worst.d]}s te cuestan más`, body: `Ese día cumples ${worst.rate}% de tus tareas (frente a ${best.rate}% los ${DAYS[best.d]}s). Prueba a ponerte menos tareas ese día.` });
    }
    if (best.rate >= 80) push({ id: 'weekday_best', kind: 'praise', icon: '💚', title: `Los ${DAYS[best.d]}s eres imparable`, body: `Cumples ${best.rate}% de lo que planeas ese día. Aprovéchalo para las tareas más importantes.` });
  }

  // ── Sobrecarga
  const perDay = {};
  for (const t of planned) (perDay[t.date] ||= []).push(t);
  const heavy = Object.values(perDay).filter((l) => l.length > 6);
  const light = Object.values(perDay).filter((l) => l.length >= 1 && l.length <= 6);
  if (heavy.length >= 2 && light.length >= 3) {
    const rate = (ls) => pct(ls.flat().filter((t) => t.completed).length, ls.flat().length);
    if (rate(light) - rate(heavy) >= 20) {
      push({ id: 'overload', kind: 'tip', icon: '⚖️', title: 'Menos es más', body: `Los días con más de 6 tareas cumples ${rate(heavy)}%, y con 6 o menos ${rate(light)}%. Intenta planear entre 3 y 5 al día.` });
    }
  }

  // ── Categorías
  const byCat = {};
  for (const t of planned) {
    byCat[t.category] ||= { total: 0, done: 0 };
    byCat[t.category].total++;
    if (t.completed) byCat[t.category].done++;
  }
  const catStats = Object.entries(byCat).filter(([, v]) => v.total >= 4).map(([id, v]) => ({ id, rate: pct(v.done, v.total) }));
  if (catStats.length >= 2) {
    const best = [...catStats].sort((a, b) => b.rate - a.rate)[0];
    const worst = [...catStats].sort((a, b) => a.rate - b.rate)[0];
    if (best.rate >= 75) push({ id: 'cat_best', kind: 'praise', icon: '🏅', title: `Tu fuerte es ${catName(best.id)}`, body: `Cumples ${best.rate}% de tus tareas de ${catName(best.id).toLowerCase()}. ¡Qué constancia!` });
    if (worst.rate <= 50 && best.rate - worst.rate >= 25) push({ id: 'cat_worst', kind: 'improve', icon: '🎯', title: `${catName(worst.id)} necesita un empujón`, body: `Solo cumples ${worst.rate}% de las tareas de ${catName(worst.id).toLowerCase()}. Prueba tareas más pequeñas o un horario fijo para ellas.` });
  }

  // ── Momento del día
  const hours = tasks.filter((t) => t.completed && Number.isInteger(t.completedHour));
  if (hours.length >= 8) {
    const buckets = { morning: 0, afternoon: 0, night: 0 };
    for (const t of hours) {
      if (t.completedHour >= 5 && t.completedHour < 12) buckets.morning++;
      else if (t.completedHour >= 12 && t.completedHour < 19) buckets.afternoon++;
      else buckets.night++;
    }
    const [name, count] = Object.entries(buckets).sort((a, b) => b[1] - a[1])[0];
    if (pct(count, hours.length) >= 50) {
      const label = { morning: 'por la mañana', afternoon: 'por la tarde', night: 'por la noche' }[name];
      push({ id: 'time_best', kind: 'tip', icon: name === 'morning' ? '🌅' : name === 'afternoon' ? '☀️' : '🌙', title: `Rindes más ${label}`, body: `El ${pct(count, hours.length)}% de tus tareas las terminas ${label}. Deja ahí lo más difícil.` });
    }
  }

  const order = { alert: 0, improve: 1, tip: 2, praise: 3 };
  items.sort((a, b) => order[a.kind] - order[b.kind]);

  const mood = overdueCount >= 5 ? 'worried' : doneToday >= dailyGoal ? 'celebrate' : streak >= 7 ? 'proud' : 'happy';
  return {
    items: items.slice(0, 7),
    summary: { weekRate, prevRate, weekDone, weekPlanned: week.length, mood },
  };
}

module.exports = { buildInsights };
