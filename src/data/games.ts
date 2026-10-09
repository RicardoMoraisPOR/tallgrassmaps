export type Platform =
  | 'Game Boy'
  | 'Game Boy Color'
  | 'Game Boy Advance'
  | 'Nintendo DS'
  | 'Nintendo 3DS'
  | 'Nintendo Switch';

export type LabelPart = { text: string; color?: string };

export type GameStatus = 'complete' | 'missing-content';
export type GameContentStatus = 'complete' | 'missing' | 'in-progress';
export type GameContentSection =
  | 'town-map-sprites'
  | 'town-map-data'
  | 'map-tile-sprites'
  | 'map-tile-data'
  | 'pokedex'
  | 'wild-encounters'
  | 'trainer-battles'
  | 'items'
  | 'static-gift-pokemon'
  | 'game-theme-ui';

const gameContentSectionTitles: Record<GameContentSection, string> = {
  'town-map-sprites': 'Town Map Sprites',
  'town-map-data': 'Town Map Data',
  'map-tile-sprites': 'Map Tile Sprites',
  'map-tile-data': 'Map Tile Data',
  pokedex: 'Pokedex',
  'wild-encounters': 'Wild Encounters',
  'trainer-battles': 'Trainer Battles',
  items: 'Items',
  'static-gift-pokemon': 'Static & Gift Pokémon',
  'game-theme-ui': 'Game Theme UI',
};

export const gameContentSectionTitle = (section: GameContentSection) =>
  gameContentSectionTitles[section];

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
  platform: Platform;
  tileSize?: number;
  sprites?: {
    set: string;
    count: number;
    pixelated?: boolean;
    extension?: 'png' | 'webp';
  };
  obtainableWithoutTrading?: number;
  obtainableExcluding?: string;
  contentStatus?: Array<{
    section: GameContentSection;
    status: GameContentStatus;
    details?: string;
  }>;
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
    tileSize: 16,
    sprites: { set: 'yellow', count: 151 },
    obtainableWithoutTrading: 134,
    colors: ['oklch(0.86 0.16 92)'],
  },
  {
    id: 'legends-za',
    fullName: 'Pokémon Legends: Z-A',
    shortName: 'Legends Z-A',
    status: 'missing-content',
    generation: 9,
    region: 'lumiose-za',
    platform: 'Nintendo Switch',
    sprites: {
      set: 'legends-za',
      count: 870,
      pixelated: false,
      extension: 'webp',
    },
    obtainableWithoutTrading: 226,
    obtainableExcluding: 'DLC or trading',
    contentStatus: [
      {
        section: 'town-map-sprites',
        status: 'in-progress',
        details: 'Tall Grass version is missing',
      },
      {
        section: 'town-map-data',
        status: 'missing',
      },
      {
        section: 'map-tile-sprites',
        status: 'missing',
      },
      {
        section: 'map-tile-data',
        status: 'missing',
      },
      {
        section: 'pokedex',
        status: 'in-progress',
        details:
          'Pokémon entries, types, evolutions, and game availability are being added.',
      },
      {
        section: 'wild-encounters',
        status: 'missing',
      },
      {
        section: 'trainer-battles',
        status: 'missing',
      },
      {
        section: 'items',
        status: 'missing',
      },
      {
        section: 'static-gift-pokemon',
        status: 'missing',
      },
      {
        section: 'game-theme-ui',
        status: 'missing',
      },
    ],
    colors: ['oklch(0.7 0.14 150)'],
  },
];

export const getGame = (id: string | undefined) =>
  games.find((game) => game.id === id);

export const gamesSharingMap = (game: Game) =>
  games.filter((other) => other.region === game.region);
