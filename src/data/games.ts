export type Platform =
  | 'Game Boy'
  | 'Game Boy Color'
  | 'Game Boy Advance'
  | 'Nintendo DS'
  | 'Nintendo 3DS'
  | 'Nintendo Switch';

export type LabelPart = { text: string; color?: string };

const colorLetters: Array<[text: string, color: string]> = [
  ['C', 'oklch(0.6 0.22 25)'],
  ['o', 'oklch(0.55 0.2 300)'],
  ['l', 'oklch(0.65 0.2 145)'],
  ['o', 'oklch(0.85 0.17 95)'],
  ['r', 'oklch(0.55 0.18 255)'],
];

export const platformParts: Record<Platform, Array<LabelPart>> = {
  'Game Boy': [{ text: 'Game Boy', color: 'oklch(0.74 0.18 125)' }],
  'Game Boy Color': [
    { text: 'Game Boy ' },
    ...colorLetters.map(([text, color]) => ({ text, color })),
  ],
  'Game Boy Advance': [
    { text: 'Game Boy ' },
    { text: 'Advance', color: 'oklch(0.5 0.2 280)' },
  ],
  'Nintendo DS': [{ text: 'Nintendo DS' }],
  'Nintendo 3DS': [
    { text: 'Nintendo ' },
    { text: '3', color: 'oklch(0.6 0.23 27)' },
    { text: 'DS' },
  ],
  'Nintendo Switch': [
    { text: 'Nintendo', color: 'oklch(0.75 0.14 215)' },
    { text: ' ' },
    { text: 'Switch', color: 'oklch(0.66 0.21 22)' },
  ],
};

export type Game = {
  id: string;
  name: string;
  generation: number;
  region: string;
  platform: Platform;
  colors: Array<string>;
};

export const games: Array<Game> = [
  {
    id: 'red',
    name: 'Pokémon Red',
    generation: 1,
    region: 'kanto-rby',
    platform: 'Game Boy',
    colors: ['oklch(0.58 0.2 27)'],
  },
  {
    id: 'blue',
    name: 'Pokémon Blue',
    generation: 1,
    region: 'kanto-rby',
    platform: 'Game Boy',
    colors: ['oklch(0.5 0.17 262)'],
  },
  {
    id: 'yellow',
    name: 'Pokémon Yellow',
    generation: 1,
    region: 'kanto-rby',
    platform: 'Game Boy',
    colors: ['oklch(0.86 0.16 92)'],
  },
];

export const getGame = (id: string | undefined) =>
  games.find((game) => game.id === id);

export const gamesSharingMap = (game: Game) =>
  games.filter((other) => other.region === game.region);
