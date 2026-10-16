export type Platform =
  | 'Game Boy'
  | 'Game Boy Color'
  | 'Game Boy Advance'
  | 'Nintendo DS'
  | 'Nintendo 3DS'
  | 'Nintendo Switch';

export type LabelPart = { text: string; color?: string };

export type GameStatus = 'complete';
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
  fullName: string;
  shortName: string;
  status: GameStatus;
  generation: number;
  region: string;
  regions?: Array<string>;
  platform: Platform;
  releaseDate: string;
  developer: string;
  wiki: string;
  tileSize?: number;
  sprites?: {
    set: string;
    count: number;
    pixelated?: boolean;
    extension?: 'png' | 'webp';
  };
  obtainableWithoutTrading?: number;
  obtainableExcluding?: string;
  colors: Array<string>;
};

export const games: Array<Game> = [
  {
    id: 'red',
    fullName: 'Pokémon Red',
    shortName: 'Red',
    status: 'complete',
    generation: 1,
    region: 'kanto-rby',
    platform: 'Game Boy',
    releaseDate: '1998-09-28',
    developer: 'Game Freak',
    wiki: 'Pokémon_Red_and_Blue_Versions',
    tileSize: 16,
    sprites: { set: 'red-blue', count: 151 },
    obtainableWithoutTrading: 135,
    colors: ['oklch(0.58 0.2 27)'],
  },
  {
    id: 'blue',
    fullName: 'Pokémon Blue',
    shortName: 'Blue',
    status: 'complete',
    generation: 1,
    region: 'kanto-rby',
    platform: 'Game Boy',
    releaseDate: '1998-09-28',
    developer: 'Game Freak',
    wiki: 'Pokémon_Red_and_Blue_Versions',
    tileSize: 16,
    sprites: { set: 'red-blue', count: 151 },
    obtainableWithoutTrading: 135,
    colors: ['oklch(0.5 0.17 262)'],
  },
  {
    id: 'yellow',
    fullName: 'Pokémon Yellow',
    shortName: 'Yellow',
    status: 'complete',
    generation: 1,
    region: 'kanto-rby',
    platform: 'Game Boy',
    releaseDate: '1999-10-19',
    developer: 'Game Freak',
    wiki: 'Pokémon_Yellow_Version',
    tileSize: 16,
    sprites: { set: 'yellow', count: 151 },
    obtainableWithoutTrading: 134,
    colors: ['oklch(0.86 0.16 92)'],
  },
  {
    id: 'legends-za',
    fullName: 'Pokémon Legends: Z-A',
    shortName: 'Legends Z-A',
    status: 'complete',
    generation: 9,
    region: 'lumiose-za',
    platform: 'Nintendo Switch',
    releaseDate: '2025-10-16',
    developer: 'Game Freak',
    wiki: 'Pokémon_Legends:_Z-A',
    sprites: {
      set: 'legends-za',
      count: 998,
      pixelated: false,
      extension: 'webp',
    },
    obtainableWithoutTrading: 226,
    obtainableExcluding: 'DLC or trading',
    colors: ['oklch(0.7 0.14 150)'],
  },
];

export const getGame = (id: string | undefined) =>
  games.find((game) => game.id === id);

export const regionIdsOf = (game: Game) => game.regions ?? [game.region];

export const gamesSharingMap = (game: Game) =>
  games.filter((other) => other.region === game.region);
