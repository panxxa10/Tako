// Catálogo de la tienda y reglas de recompensa. El frontend dibuja cada artículo por su "id"; aquí viven nombres y precios.
const SLOTS = ['shell', 'hat', 'glasses', 'neck', 'scene'];

const ITEMS = [
  // Colores de caparazón
  { id: 'shell_green', slot: 'shell', name: 'Verde Tako', price: 0 },
  { id: 'shell_teal', slot: 'shell', name: 'Turquesa', price: 0 },
  { id: 'shell_blue', slot: 'shell', name: 'Azul océano', price: 40 },
  { id: 'shell_purple', slot: 'shell', name: 'Violeta', price: 60 },
  { id: 'shell_pink', slot: 'shell', name: 'Rosa chicle', price: 60 },
  { id: 'shell_orange', slot: 'shell', name: 'Naranja sol', price: 80 },
  { id: 'shell_gold', slot: 'shell', name: 'Dorado', price: 200 },
  // Sombreros
  { id: 'hat_flower', slot: 'hat', name: 'Flor', price: 30 },
  { id: 'hat_cap', slot: 'hat', name: 'Gorra', price: 40 },
  { id: 'hat_beanie', slot: 'hat', name: 'Gorro de lana', price: 40 },
  { id: 'hat_party', slot: 'hat', name: 'Gorro de fiesta', price: 50 },
  { id: 'hat_grad', slot: 'hat', name: 'Birrete', price: 60 },
  { id: 'hat_headphones', slot: 'hat', name: 'Audífonos', price: 70 },
  { id: 'hat_wizard', slot: 'hat', name: 'Sombrero de mago', price: 90 },
  { id: 'hat_crown', slot: 'hat', name: 'Corona', price: 150 },
  // Gafas
  { id: 'glasses_round', slot: 'glasses', name: 'Gafas redondas', price: 40 },
  { id: 'glasses_sun', slot: 'glasses', name: 'Gafas de sol', price: 60 },
  { id: 'glasses_heart', slot: 'glasses', name: 'Gafas de corazón', price: 80 },
  // Cuello
  { id: 'neck_bow', slot: 'neck', name: 'Moño', price: 30 },
  { id: 'neck_scarf', slot: 'neck', name: 'Bufanda', price: 40 },
  { id: 'neck_bandana', slot: 'neck', name: 'Pañuelo', price: 40 },
  { id: 'neck_medal', slot: 'neck', name: 'Medalla', price: 100 },
  // Escenarios
  { id: 'scene_meadow', slot: 'scene', name: 'Pradera', price: 0 },
  { id: 'scene_beach', slot: 'scene', name: 'Playa', price: 50 },
  { id: 'scene_sunset', slot: 'scene', name: 'Atardecer', price: 60 },
  { id: 'scene_night', slot: 'scene', name: 'Noche estrellada', price: 60 },
  { id: 'scene_space', slot: 'scene', name: 'Espacio', price: 120 },
];

const ITEM_BY_ID = Object.fromEntries(ITEMS.map((i) => [i.id, i]));
const DEFAULT_PET = { name: 'Tako', shell: 'shell_green', hat: null, glasses: null, neck: null, scene: 'scene_meadow' };

const FREEZE = { id: 'freeze', name: 'Escudo de racha', price: 50, max: 2 };

const CATEGORIES = [
  { id: 'personal', name: 'Personal', emoji: '⭐' },
  { id: 'estudio', name: 'Estudio', emoji: '📚' },
  { id: 'trabajo', name: 'Trabajo', emoji: '💼' },
  { id: 'casa', name: 'Casa', emoji: '🏠' },
  { id: 'salud', name: 'Salud', emoji: '💪' },
  { id: 'social', name: 'Social', emoji: '🎉' },
  { id: 'finanzas', name: 'Finanzas', emoji: '💰' },
  { id: 'creativo', name: 'Creativo', emoji: '🎨' },
];
const CATEGORY_IDS = CATEGORIES.map((c) => c.id);

const REWARDS = {
  task: { xp: 10, coins: 5 },
  goal: { xp: 20, coins: 10 },
  focus: { xp: 5, coins: 3, minMinutes: 15, maxPerDay: 4 },
  dailyTaskCap: 10, // máximo de tareas que dan recompensa por día (evita "granjear" tareas falsas)
  welcomeCoins: 30,
};

module.exports = { SLOTS, ITEMS, ITEM_BY_ID, DEFAULT_PET, FREEZE, CATEGORIES, CATEGORY_IDS, REWARDS };
