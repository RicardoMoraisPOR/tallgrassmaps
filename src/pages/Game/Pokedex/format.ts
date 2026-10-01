import type {
  Encounter,
  EncounterMethod,
  Evolution,
} from '@/data/pokedex/types';

const methodLabels: Record<EncounterMethod, string> = {
  walk: 'Wild',
  surf: 'Surfing',
  'old-rod': 'Old Rod',
  'good-rod': 'Good Rod',
  'super-rod': 'Super Rod',
  gift: 'Gift',
  fossil: 'Revived fossil',
  'fossil-item': 'Fossil',
  static: 'One-time encounter',
  trade: 'In-game trade',
  prize: 'Game Corner prize',
};

export const dexNumber = (number: number) =>
  `#${String(number).padStart(3, '0')}`;

export const methodLabel = (encounter: Encounter) =>
  methodLabels[encounter.method];

export const levelLabel = (encounter: Encounter) => {
  if (!encounter.levels) return undefined;

  const [min, max] = encounter.levels;

  return min === max ? `Lv. ${min}` : `Lv. ${min}–${max}`;
};

export const chanceLabel = (encounter: Encounter) => {
  if (!encounter.chance) return undefined;

  const [min, max] = encounter.chance.map((value) =>
    Math.max(1, Math.round(value)),
  );

  return min === max ? `${min}%` : `${min}–${max}%`;
};

export const evolutionLabel = (evolution: Evolution) => {
  if (evolution.method === 'level') return `at level ${evolution.level}`;
  if (evolution.method === 'item') return `with a ${evolution.item}`;

  return 'by trading';
};

export const bulbapediaUrl = (name: string) =>
  `https://bulbapedia.bulbagarden.net/wiki/${encodeURIComponent(`${name.replaceAll(' ', '_')}_(Pokémon)`)}`;
