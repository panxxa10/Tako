// Deben coincidir con backend/domain/catalog.js
export const CATEGORIES = [
  { id: 'personal', name: 'Personal', emoji: '⭐' },
  { id: 'estudio', name: 'Estudio', emoji: '📚' },
  { id: 'trabajo', name: 'Trabajo', emoji: '💼' },
  { id: 'casa', name: 'Casa', emoji: '🏠' },
  { id: 'salud', name: 'Salud', emoji: '💪' },
  { id: 'social', name: 'Social', emoji: '🎉' },
  { id: 'finanzas', name: 'Finanzas', emoji: '💰' },
  { id: 'creativo', name: 'Creativo', emoji: '🎨' },
];
export const categoryOf = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];

export const SLOT_LABELS = { shell: 'Caparazón', hat: 'Sombreros', glasses: 'Gafas', neck: 'Cuello', scene: 'Escenarios' };
export const SLOT_ORDER = ['hat', 'glasses', 'neck', 'shell', 'scene'];
