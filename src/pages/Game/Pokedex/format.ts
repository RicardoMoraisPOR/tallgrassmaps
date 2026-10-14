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
  battle: 'Battle only',
  hyperspace: 'Hyperspace Lumiose',
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

export const alphaLabel = (encounter: Encounter, withMethod = false) => {
  const { alpha } = encounter;

  if (!alpha) return undefined;

  const levels =
    alpha.levels && levelLabel({ levels: alpha.levels } as Encounter);

  const always = alpha.chance >= 100;
  const method = withMethod ? methodLabel(encounter) : undefined;

  return [
    always
      ? [method, 'Always alpha'].filter(Boolean).join(' · ')
      : `${method ? `${method} ` : ''}Alpha (${alpha.chance}%)`,
    levels,
  ]
    .filter(Boolean)
    .join(' · ');
};

export const chanceLabel = (encounter: Encounter) => {
  if (!encounter.chance) return undefined;

  const [min, max] = encounter.chance.map((value) =>
    Math.max(1, Math.round(value)),
  );

  return min === max ? `${min}%` : `${min}–${max}%`;
};

const withArticle = (item: string | undefined) =>
  `${/^[aeiou]/i.test(item ?? '') ? 'an' : 'a'} ${item}`;

const evolutionMethodLabel = ({ method, level, item }: Evolution) => {
  if (method === 'level') return `at level ${level}`;
  if (method === 'item') return `with ${withArticle(item)}`;
  if (method === 'trade')
    return item
      ? `by trading while holding ${withArticle(item)}`
      : 'by trading';

  return undefined;
};

export const evolutionLabel = (evolution: Evolution) =>
  [evolutionMethodLabel(evolution), evolution.note].filter(Boolean).join(' ');

export type EvolutionTrigger = { primary: string; secondary?: string };

export const evolutionTrigger = ({
  method,
  level,
  item,
  note,
}: Evolution): EvolutionTrigger => {
  if (method === 'level') return { primary: `Lv. ${level}`, secondary: note };
  if (method === 'item') return { primary: item ?? 'Item', secondary: note };
  if (method === 'trade')
    return {
      primary: 'Trade',
      secondary: [item && `holding ${item}`, note].filter(Boolean).join(' '),
    };

  const friendship = note?.match(/^with high friendship\s*(.*)$/i);

  if (friendship)
    return { primary: 'Friendship', secondary: friendship[1] || undefined };

  return { primary: 'Level up', secondary: note };
};

export const bulbapediaUrl = (name: string) =>
  `https://bulbapedia.bulbagarden.net/wiki/${encodeURIComponent(`${name.replaceAll(' ', '_')}_(Pokémon)`)}`;
