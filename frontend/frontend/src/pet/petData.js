// Paletas y estados de Tako. Los ids coinciden con el catálogo del backend (domain/catalog.js).
export const SKIN = { skin: '#A6E36E', skinShade: '#82C94F', skinLight: '#C8F29B', belly: '#FFF3CF', bellyShade: '#F1DFA8' };

export const SHELLS = {
  shell_green:  { main: '#2FB57A', dark: '#1B8A5A', hex: '#5BCF98' },
  shell_teal:   { main: '#27B5C6', dark: '#178A99', hex: '#62D2DF' },
  shell_blue:   { main: '#4D8DFF', dark: '#2F63CC', hex: '#82B0FF' },
  shell_purple: { main: '#9B7BFF', dark: '#6F4FD6', hex: '#BBA5FF' },
  shell_pink:   { main: '#FF7BAC', dark: '#D4507F', hex: '#FFA6C8' },
  shell_orange: { main: '#FF9A3D', dark: '#D6741A', hex: '#FFBC74' },
  shell_gold:   { main: '#F5C542', dark: '#C9961A', hex: '#FFE17F' },
};

export const MOODS = {
  happy: 'Contento', celebrate: '¡De fiesta!', proud: 'Orgulloso', sad: 'Triste', worried: 'Preocupado',
  sleepy: 'Dormilón', thinking: 'Pensando', focus: 'Concentrado', love: 'Enamorado',
};

// Puntos de un hexágono (vértice arriba) para el dibujo del caparazón
export const hexPoints = (cx, cy, r) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 180) * (60 * i - 90);
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(' ');
