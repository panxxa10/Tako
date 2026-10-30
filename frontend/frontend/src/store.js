import { reactive } from 'vue';
import api from './api';
import { confetti } from './utils/confetti';

export const state = reactive({
  me: null,
  loaded: false,
  toasts: [],
  levelUp: null,
  reactionMood: null,   // estado de ánimo temporal de Tako tras una acción
  reactionText: '',
  loadError: '',
});

let toastId = 0;
let reactionTimer = null;

export function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'light' || theme === 'dark') root.dataset.theme = theme;
  else delete root.dataset.theme;
  try { localStorage.setItem('tako-theme', theme || 'auto'); } catch { /* sin almacenamiento */ }
}
try { applyTheme(localStorage.getItem('tako-theme') || 'auto'); } catch { /* ignorar */ }

export function setMe(me) {
  state.me = me;
  state.loaded = true;
  applyTheme(me.user.theme);
}

export async function loadMe() {
  const { data } = await api.get('/api/me');
  setMe(data);
  return data;
}

export function clearSession() {
  localStorage.removeItem('token');
  state.me = null;
  state.loaded = false;
  state.toasts = [];
  state.levelUp = null;
}

export function toast(t, ms = 4200) {
  const id = ++toastId;
  state.toasts.push({ id, ...t });
  setTimeout(() => dismissToast(id), ms);
}
export const dismissToast = (id) => { state.toasts = state.toasts.filter((t) => t.id !== id); };

export function reaction(mood, text, ms = 3800) {
  state.reactionMood = mood;
  state.reactionText = text;
  clearTimeout(reactionTimer);
  reactionTimer = setTimeout(() => { state.reactionMood = null; state.reactionText = ''; }, ms);
}

/** Procesa la respuesta de una acción (completar tarea, comprar, enfoque...): actualiza datos y celebra. */
export function celebrate(result) {
  if (result.me) setMe(result.me);
  const r = result.rewards;
  const achievements = result.achievements || [];

  if (r && (r.xp || r.coins)) toast({ kind: 'reward', xp: r.xp, coins: r.coins }, 2600);
  if (r?.capped) toast({ kind: 'info', text: 'Llegaste al tope de recompensas de hoy (10 tareas). ¡Tu racha sigue sumando!' });
  if (r?.goalReached) {
    toast({ kind: 'goal', text: '¡Meta diaria cumplida! Bono de monedas y experiencia 🎯' });
    confetti({ count: 120 });
    reaction('celebrate', '¡Cumpliste tu meta de hoy! 🎉');
  } else if (r && (r.xp || r.coins)) {
    reaction('proud', '¡Eso es! Cada tarea cuenta 💚', 2800);
  }
  achievements.forEach((a, i) => setTimeout(() => {
    toast({ kind: 'achievement', achievement: a }, 5200);
    confetti({ count: 60 });
  }, 500 + i * 700));
  if (r?.levelUp) setTimeout(() => { state.levelUp = r.levelUp; confetti({ count: 160, duration: 2600 }); }, 400);
}
