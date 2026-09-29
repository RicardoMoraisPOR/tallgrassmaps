import { type Game, games, type Platform } from './games';
import { getRegion } from './maps';

export type UpcomingGame = {
  id: string;
  title: string;
  regions: Array<string>;
  platform: Platform;
  versionGroup: string;
  colors: Array<string>;
};

export type CatalogEntry =
  | { status: 'available'; game: Game }
  | { status: 'soon'; game: UpcomingGame };

export type Generation = {
  number: number;
  roman: string;
  entries: Array<CatalogEntry>;
};

const C = {
  yellow: 'oklch(0.86 0.16 92)',
  gold: 'oklch(0.76 0.12 85)',
  silver: 'oklch(0.78 0.01 250)',
  crystal: 'oklch(0.78 0.09 220)',
  ruby: 'oklch(0.52 0.2 20)',
  sapphire: 'oklch(0.48 0.16 265)',
  emerald: 'oklch(0.62 0.15 155)',
  fire: 'oklch(0.64 0.2 38)',
  leaf: 'oklch(0.66 0.17 140)',
  diamond: 'oklch(0.72 0.1 250)',
  pearl: 'oklch(0.8 0.07 350)',
  platinum: 'oklch(0.7 0.02 260)',
  black: 'oklch(0.25 0 0)',
  white: 'oklch(0.95 0 0)',
  x: 'oklch(0.5 0.15 255)',
  y: 'oklch(0.55 0.2 25)',
  sun: 'oklch(0.72 0.17 60)',
  moon: 'oklch(0.5 0.15 300)',
  ultraSun: 'oklch(0.7 0.18 50)',
  ultraMoon: 'oklch(0.45 0.18 290)',
  eevee: 'oklch(0.65 0.1 60)',
  sword: 'oklch(0.6 0.13 230)',
  shield: 'oklch(0.55 0.18 10)',
  arceus: 'oklch(0.75 0.08 90)',
  scarlet: 'oklch(0.6 0.22 25)',
  violet: 'oklch(0.5 0.2 305)',
  za: 'oklch(0.7 0.14 150)',
};

const soon = (
  versionGroup: string,
  platform: Platform,
  regions: Array<string>,
  titles: Array<[id: string, title: string, color: string]>,
): Array<CatalogEntry> =>
  titles.map(([id, title, color]) => ({
    status: 'soon',
    game: { id, title, regions, platform, versionGroup, colors: [color] },
  }));

const available = (generation: number): Array<CatalogEntry> =>
  games
    .filter((game) => game.generation === generation)
    .map((game) => ({ status: 'available', game }));

export const entryName = (entry: CatalogEntry) =>
  entry.status === 'soon' ? entry.game.title : entry.game.fullName;

export const entryRegions = (entry: CatalogEntry): Array<string> =>
  entry.status === 'soon'
    ? entry.game.regions
    : [getRegion(entry.game.region)?.name ?? entry.game.region];

export const entryVersionGroup = (entry: CatalogEntry) =>
  entry.status === 'soon'
    ? entry.game.versionGroup
    : getRegion(entry.game.region)?.versionGroup;

export const generationRegions = (generation: Generation) => [
  ...new Set(generation.entries.flatMap(entryRegions)),
];

export const generations: Array<Generation> = [
  { number: 1, roman: 'I', entries: available(1) },
  {
    number: 2,
    roman: 'II',
    entries: soon(
      'GSC',
      'Game Boy Color',
      ['Johto', 'Kanto'],
      [
        ['gold', 'Pokémon Gold', C.gold],
        ['silver', 'Pokémon Silver', C.silver],
        ['crystal', 'Pokémon Crystal', C.crystal],
      ],
    ),
  },
  {
    number: 3,
    roman: 'III',
    entries: [
      ...soon(
        'RSE',
        'Game Boy Advance',
        ['Hoenn'],
        [
          ['ruby', 'Pokémon Ruby', C.ruby],
          ['sapphire', 'Pokémon Sapphire', C.sapphire],
          ['emerald', 'Pokémon Emerald', C.emerald],
        ],
      ),
      ...soon(
        'FRLG',
        'Game Boy Advance',
        ['Kanto'],
        [
          ['firered', 'Pokémon FireRed', C.fire],
          ['leafgreen', 'Pokémon LeafGreen', C.leaf],
        ],
      ),
    ],
  },
  {
    number: 4,
    roman: 'IV',
    entries: [
      ...soon(
        'DPPt',
        'Nintendo DS',
        ['Sinnoh'],
        [
          ['diamond', 'Pokémon Diamond', C.diamond],
          ['pearl', 'Pokémon Pearl', C.pearl],
          ['platinum', 'Pokémon Platinum', C.platinum],
        ],
      ),
      ...soon(
        'HGSS',
        'Nintendo DS',
        ['Johto', 'Kanto'],
        [
          ['heartgold', 'Pokémon HeartGold', C.gold],
          ['soulsilver', 'Pokémon SoulSilver', C.silver],
        ],
      ),
    ],
  },
  {
    number: 5,
    roman: 'V',
    entries: [
      ...soon(
        'BW',
        'Nintendo DS',
        ['Unova'],
        [
          ['black', 'Pokémon Black', C.black],
          ['white', 'Pokémon White', C.white],
        ],
      ),
      ...soon(
        'B2W2',
        'Nintendo DS',
        ['Unova'],
        [
          ['black-2', 'Pokémon Black 2', C.black],
          ['white-2', 'Pokémon White 2', C.white],
        ],
      ),
    ],
  },
  {
    number: 6,
    roman: 'VI',
    entries: [
      ...soon(
        'XY',
        'Nintendo 3DS',
        ['Kalos'],
        [
          ['x', 'Pokémon X', C.x],
          ['y', 'Pokémon Y', C.y],
        ],
      ),
      ...soon(
        'ORAS',
        'Nintendo 3DS',
        ['Hoenn'],
        [
          ['omega-ruby', 'Pokémon Omega Ruby', C.ruby],
          ['alpha-sapphire', 'Pokémon Alpha Sapphire', C.sapphire],
        ],
      ),
    ],
  },
  {
    number: 7,
    roman: 'VII',
    entries: [
      ...soon(
        'SM',
        'Nintendo 3DS',
        ['Alola'],
        [
          ['sun', 'Pokémon Sun', C.sun],
          ['moon', 'Pokémon Moon', C.moon],
        ],
      ),
      ...soon(
        'USUM',
        'Nintendo 3DS',
        ['Alola'],
        [
          ['ultra-sun', 'Pokémon Ultra Sun', C.ultraSun],
          ['ultra-moon', 'Pokémon Ultra Moon', C.ultraMoon],
        ],
      ),
      ...soon(
        'LGPE',
        'Nintendo Switch',
        ['Kanto'],
        [
          ['lets-go-pikachu', "Pokémon Let's Go, Pikachu!", C.yellow],
          ['lets-go-eevee', "Pokémon Let's Go, Eevee!", C.eevee],
        ],
      ),
    ],
  },
  {
    number: 8,
    roman: 'VIII',
    entries: [
      ...soon(
        'SwSh',
        'Nintendo Switch',
        ['Galar'],
        [
          ['sword', 'Pokémon Sword', C.sword],
          ['shield', 'Pokémon Shield', C.shield],
        ],
      ),
      ...soon(
        'BDSP',
        'Nintendo Switch',
        ['Sinnoh'],
        [
          ['brilliant-diamond', 'Pokémon Brilliant Diamond', C.diamond],
          ['shining-pearl', 'Pokémon Shining Pearl', C.pearl],
        ],
      ),
      ...soon(
        'PLA',
        'Nintendo Switch',
        ['Hisui'],
        [['legends-arceus', 'Pokémon Legends: Arceus', C.arceus]],
      ),
    ],
  },
  {
    number: 9,
    roman: 'IX',
    entries: [
      ...soon(
        'SV',
        'Nintendo Switch',
        ['Paldea'],
        [
          ['scarlet', 'Pokémon Scarlet', C.scarlet],
          ['violet', 'Pokémon Violet', C.violet],
        ],
      ),
      ...soon(
        'Z-A',
        'Nintendo Switch',
        ['Kalos'],
        [['legends-za', 'Pokémon Legends: Z-A', C.za]],
      ),
    ],
  },
];

export const versionGroupNames = (versionGroup: string) =>
  generations
    .flatMap(({ entries }) => entries)
    .filter((entry) => entryVersionGroup(entry) === versionGroup)
    .map(entryName);

const versionGroupLetters: Record<
  string,
  Array<[text: string, gameId?: string]>
> = {
  RBY: [
    ['R', 'red'],
    ['B', 'blue'],
    ['Y', 'yellow'],
  ],
  GSC: [
    ['G', 'gold'],
    ['S', 'silver'],
    ['C', 'crystal'],
  ],
  RSE: [
    ['R', 'ruby'],
    ['S', 'sapphire'],
    ['E', 'emerald'],
  ],
  FRLG: [
    ['FR', 'firered'],
    ['LG', 'leafgreen'],
  ],
  DPPt: [
    ['D', 'diamond'],
    ['P', 'pearl'],
    ['Pt', 'platinum'],
  ],
  HGSS: [
    ['HG', 'heartgold'],
    ['SS', 'soulsilver'],
  ],
  BW: [
    ['B', 'black'],
    ['W', 'white'],
  ],
  B2W2: [
    ['B2', 'black-2'],
    ['W2', 'white-2'],
  ],
  XY: [
    ['X', 'x'],
    ['Y', 'y'],
  ],
  ORAS: [
    ['OR', 'omega-ruby'],
    ['AS', 'alpha-sapphire'],
  ],
  SM: [
    ['S', 'sun'],
    ['M', 'moon'],
  ],
  USUM: [
    ['US', 'ultra-sun'],
    ['UM', 'ultra-moon'],
  ],
  LGPE: [['LG'], ['P', 'lets-go-pikachu'], ['E', 'lets-go-eevee']],
  SwSh: [
    ['Sw', 'sword'],
    ['Sh', 'shield'],
  ],
  BDSP: [
    ['BD', 'brilliant-diamond'],
    ['SP', 'shining-pearl'],
  ],
  PLA: [['PLA', 'legends-arceus']],
  SV: [
    ['S', 'scarlet'],
    ['V', 'violet'],
  ],
  'Z-A': [['Z-A', 'legends-za']],
};

const gameColor = (gameId: string) =>
  generations
    .flatMap(({ entries }) => entries)
    .find((entry) => entry.game.id === gameId)?.game.colors[0];

export const versionGroupParts = (versionGroup: string) =>
  (versionGroupLetters[versionGroup] ?? [[versionGroup]]).map(
    ([text, gameId]) => ({ text, color: gameId && gameColor(gameId) }),
  );

export type MapSetGame = {
  id: string;
  name: string;
  color: string;
  available: boolean;
};

export type MapSet = {
  versionGroup: string;
  regions: Array<string>;
  games: Array<MapSetGame>;
  available: boolean;
};

export const mapSets = generations
  .flatMap(({ entries }) => entries)
  .reduce<Array<MapSet>>((sets, entry) => {
    const versionGroup = entryVersionGroup(entry);

    if (!versionGroup) return sets;

    const available = entry.status === 'available';
    const game = {
      id: entry.game.id,
      name:
        entry.status === 'available'
          ? entry.game.shortName
          : entry.game.title,
      color: entry.game.colors[0],
      available,
    };
    const set = sets.find((other) => other.versionGroup === versionGroup);

    if (set) {
      set.games.push(game);
      set.available ||= available;
    } else {
      sets.push({
        versionGroup,
        regions: entryRegions(entry),
        games: [game],
        available,
      });
    }

    return sets;
  }, []);
