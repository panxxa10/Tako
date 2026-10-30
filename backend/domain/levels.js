const xpNeeded = (level) => 50 + 25 * (level - 1);

const TITLES = [
  [1, 'Huevito'], [2, 'Tortuguita'], [4, 'Explorador'], [6, 'Aventurero'],
  [9, 'Sabio'], [12, 'Maestro'], [16, 'Leyenda'],
];

function levelFromXp(xp) {
  let level = 1;
  let rest = Math.max(0, xp);
  while (rest >= xpNeeded(level)) { rest -= xpNeeded(level); level++; }
  const title = [...TITLES].reverse().find(([min]) => level >= min)[1];
  return { level, xpInLevel: rest, xpForNext: xpNeeded(level), title };
}

module.exports = { levelFromXp, xpNeeded };
