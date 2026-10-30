// Logros. "metric" indica qué estadística se mide; se desbloquea al llegar a "target". "coins" es el premio.
const ACHIEVEMENTS = [
  { id: 'first_task', name: 'Primer paso', desc: 'Completa tu primera tarea', icon: 'step', tier: 'bronze', metric: 'totalCompleted', target: 1, coins: 10 },
  { id: 'tasks_10', name: 'En marcha', desc: 'Completa 10 tareas', icon: 'check', tier: 'bronze', metric: 'totalCompleted', target: 10, coins: 15 },
  { id: 'tasks_25', name: 'Constante', desc: 'Completa 25 tareas', icon: 'check', tier: 'silver', metric: 'totalCompleted', target: 25, coins: 25 },
  { id: 'tasks_50', name: 'Imparable', desc: 'Completa 50 tareas', icon: 'rocket', tier: 'silver', metric: 'totalCompleted', target: 50, coins: 40 },
  { id: 'tasks_100', name: 'Centenario', desc: 'Completa 100 tareas', icon: 'trophy', tier: 'gold', metric: 'totalCompleted', target: 100, coins: 75 },
  { id: 'tasks_250', name: 'Rey Tako', desc: 'Completa 250 tareas', icon: 'crown', tier: 'special', metric: 'totalCompleted', target: 250, coins: 150 },

  { id: 'streak_3', name: 'Calentando motores', desc: 'Racha de 3 días', icon: 'flame', tier: 'bronze', metric: 'bestStreak', target: 3, coins: 15 },
  { id: 'streak_7', name: 'Semana perfecta', desc: 'Racha de 7 días', icon: 'flame', tier: 'silver', metric: 'bestStreak', target: 7, coins: 40 },
  { id: 'streak_14', name: 'Dos semanas', desc: 'Racha de 14 días', icon: 'flame', tier: 'gold', metric: 'bestStreak', target: 14, coins: 70 },
  { id: 'streak_30', name: 'Mes de hierro', desc: 'Racha de 30 días', icon: 'flame', tier: 'gold', metric: 'bestStreak', target: 30, coins: 120 },
  { id: 'streak_100', name: 'Racha legendaria', desc: 'Racha de 100 días', icon: 'flame', tier: 'special', metric: 'bestStreak', target: 100, coins: 300 },

  { id: 'level_3', name: 'Subiendo', desc: 'Llega al nivel 3', icon: 'star', tier: 'bronze', metric: 'level', target: 3, coins: 15 },
  { id: 'level_5', name: 'Explorador', desc: 'Llega al nivel 5', icon: 'star', tier: 'silver', metric: 'level', target: 5, coins: 30 },
  { id: 'level_10', name: 'Sabio', desc: 'Llega al nivel 10', icon: 'star', tier: 'gold', metric: 'level', target: 10, coins: 80 },

  { id: 'goal_1', name: 'Meta cumplida', desc: 'Cumple tu meta diaria', icon: 'target', tier: 'bronze', metric: 'goalDays', target: 1, coins: 10 },
  { id: 'goal_7', name: 'Siempre a la meta', desc: 'Cumple tu meta diaria 7 días', icon: 'target', tier: 'silver', metric: 'goalDays', target: 7, coins: 40 },
  { id: 'goal_30', name: 'Maestro de la meta', desc: 'Cumple tu meta diaria 30 días', icon: 'target', tier: 'gold', metric: 'goalDays', target: 30, coins: 100 },
  { id: 'perfect_day', name: 'Día perfecto', desc: 'Completa todas las tareas de un día (mínimo 3)', icon: 'sparkle', tier: 'silver', metric: 'perfectDays', target: 1, coins: 25 },

  { id: 'shopper', name: 'De compras', desc: 'Compra tu primer artículo', icon: 'bag', tier: 'bronze', metric: 'itemsOwned', target: 1, coins: 10 },
  { id: 'collector', name: 'Coleccionista', desc: 'Ten 6 artículos de la tienda', icon: 'bag', tier: 'silver', metric: 'itemsOwned', target: 6, coins: 40 },
  { id: 'stylist', name: 'Con estilo', desc: 'Viste a Tako con sombrero, gafas y algo en el cuello', icon: 'hat', tier: 'silver', metric: 'equippedSlots', target: 3, coins: 30 },

  { id: 'focus_1', name: 'Concentrado', desc: 'Completa una sesión de enfoque', icon: 'timer', tier: 'bronze', metric: 'focusSessions', target: 1, coins: 10 },
  { id: 'focus_10', name: 'Mente de acero', desc: 'Completa 10 sesiones de enfoque', icon: 'timer', tier: 'gold', metric: 'focusSessions', target: 10, coins: 60 },
];

module.exports = { ACHIEVEMENTS };
