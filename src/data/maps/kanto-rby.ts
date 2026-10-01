import connectionData from './kanto-rby-connections.json';
import wildAreaData from './kanto-rby-wild.json';
import tallGrassMap from './tall-grass/kanto-rby.svg?raw';
import type {
  Direction,
  Location,
  LocationHotspot,
  LocationKind,
  MapMarker,
  MarkerKind,
  MapVariant,
  Rect,
  Region,
  WildArea,
} from './types';

const IMAGE_DIR = '/maps/rby';

const vgmaps = {
  name: 'VGMaps',
  url: 'https://www.vgmaps.com/Atlas/GB-GBC/',
  credit: 'RyuMaster',
};

type Size = [width: number, height: number];

const entrance = (x: number, y: number): Rect => ({
  x: x - 4,
  y: y - 4,
  width: 24,
  height: 24,
});

const rect = (x: number, y: number, width: number, height: number): Rect => ({
  x,
  y,
  width,
  height,
});

const warp = (x: number, y: number): Rect => entrance(x * 16, y * 16);

const variant = (game: string, file: string): MapVariant => ({
  games: [game],
  image: `${IMAGE_DIR}/variants/${game}/${file}`,
});

type Connection = { to: string; direction: Direction; area: Rect };

const connections = connectionData as Partial<
  Record<string, Array<Connection>>
>;

type OutdoorEntry = {
  id: string;
  name: string;
  kind: 'town' | 'route';
  size: Size;
  cell: [x: number, y: number];
  markers?: Array<MapMarker>;
  variants?: Array<MapVariant>;
};

const outdoor: Array<OutdoorEntry> = [
  {
    id: 'pallet-town',
    name: 'Pallet Town',
    kind: 'town',
    size: [320, 288],
    cell: [2, 11],
  },
  {
    id: 'viridian-city',
    name: 'Viridian City',
    kind: 'town',
    size: [640, 576],
    cell: [2, 8],
  },
  {
    id: 'pewter-city',
    name: 'Pewter City',
    kind: 'town',
    size: [640, 576],
    cell: [2, 3],
  },
  {
    id: 'cerulean-city',
    name: 'Cerulean City',
    kind: 'town',
    size: [640, 576],
    cell: [10, 2],
  },
  {
    id: 'vermilion-city',
    name: 'Vermilion City',
    kind: 'town',
    size: [640, 576],
    cell: [10, 9],
  },
  {
    id: 'lavender-town',
    name: 'Lavender Town',
    kind: 'town',
    size: [320, 288],
    cell: [14, 5],
    markers: [
      { kind: 'house', name: "Mr. Fuji's House", ...entrance(112, 144) },
      { kind: 'house', name: 'Cubone House', ...entrance(48, 208) },
      { kind: 'house', name: "Name Rater's House", ...entrance(112, 208) },
    ],
  },
  {
    id: 'celadon-city',
    name: 'Celadon City',
    kind: 'town',
    size: [800, 576],
    cell: [7, 5],
  },
  {
    id: 'saffron-city',
    name: 'Saffron City',
    kind: 'town',
    size: [640, 576],
    cell: [10, 5],
  },
  {
    id: 'fuchsia-city',
    name: 'Fuchsia City',
    kind: 'town',
    size: [640, 576],
    cell: [8, 13],
  },
  {
    id: 'cinnabar-island',
    name: 'Cinnabar Island',
    kind: 'town',
    size: [320, 288],
    cell: [2, 15],
  },
  {
    id: 'indigo-plateau',
    name: 'Indigo Plateau',
    kind: 'town',
    size: [320, 288],
    cell: [0, 2],
  },
  {
    id: 'route-1',
    name: 'Route 1',
    kind: 'route',
    size: [320, 576],
    cell: [2, 10],
  },
  {
    id: 'route-2',
    name: 'Route 2',
    kind: 'route',
    size: [320, 1152],
    cell: [2, 6],
  },
  {
    id: 'route-3',
    name: 'Route 3',
    kind: 'route',
    size: [1120, 288],
    cell: [4, 3],
  },
  {
    id: 'route-4',
    name: 'Route 4',
    kind: 'route',
    size: [1440, 288],
    cell: [8, 2],
    variants: [variant('yellow', 'route-4.png')],
  },
  {
    id: 'route-5',
    name: 'Route 5',
    kind: 'route',
    size: [320, 576],
    cell: [10, 3],
  },
  {
    id: 'route-6',
    name: 'Route 6',
    kind: 'route',
    size: [320, 576],
    cell: [10, 8],
  },
  {
    id: 'route-7',
    name: 'Route 7',
    kind: 'route',
    size: [320, 288],
    cell: [8, 5],
  },
  {
    id: 'route-8',
    name: 'Route 8',
    kind: 'route',
    size: [960, 288],
    cell: [13, 5],
  },
  {
    id: 'route-9',
    name: 'Route 9',
    kind: 'route',
    size: [960, 288],
    cell: [13, 2],
  },
  {
    id: 'route-10',
    name: 'Route 10',
    kind: 'route',
    size: [320, 1152],
    cell: [14, 4],
  },
  {
    id: 'route-11',
    name: 'Route 11',
    kind: 'route',
    size: [960, 288],
    cell: [12, 9],
  },
  {
    id: 'route-12',
    name: 'Route 12',
    kind: 'route',
    size: [320, 1728],
    cell: [14, 9],
  },
  {
    id: 'route-13',
    name: 'Route 13',
    kind: 'route',
    size: [960, 288],
    cell: [13, 11],
  },
  {
    id: 'route-14',
    name: 'Route 14',
    kind: 'route',
    size: [320, 864],
    cell: [11, 12],
  },
  {
    id: 'route-15',
    name: 'Route 15',
    kind: 'route',
    size: [960, 288],
    cell: [10, 13],
  },
  {
    id: 'route-16',
    name: 'Route 16',
    kind: 'route',
    size: [640, 288],
    cell: [5, 5],
  },
  {
    id: 'route-17',
    name: 'Route 17',
    kind: 'route',
    size: [320, 2304],
    cell: [4, 8],
  },
  {
    id: 'route-18',
    name: 'Route 18',
    kind: 'route',
    size: [800, 288],
    cell: [6, 13],
  },
  {
    id: 'route-19',
    name: 'Route 19',
    kind: 'route',
    size: [320, 864],
    cell: [6, 15],
    variants: [variant('yellow', 'route-19.png')],
  },
  {
    id: 'route-20',
    name: 'Route 20',
    kind: 'route',
    size: [1600, 288],
    cell: [4, 15],
  },
  {
    id: 'route-21',
    name: 'Route 21',
    kind: 'route',
    size: [320, 1440],
    cell: [2, 13],
  },
  {
    id: 'route-22',
    name: 'Route 22',
    kind: 'route',
    size: [640, 288],
    cell: [0, 8],
  },
  {
    id: 'route-23',
    name: 'Route 23',
    kind: 'route',
    size: [320, 2304],
    cell: [0, 6],
  },
  {
    id: 'route-24',
    name: 'Route 24',
    kind: 'route',
    size: [320, 576],
    cell: [10, 1],
  },
  {
    id: 'route-25',
    name: 'Route 25',
    kind: 'route',
    size: [960, 288],
    cell: [11, 0],
  },
];

type FloorEntry = {
  name: string;
  size?: Size;
  exits?: Array<
    { area: Rect; ladder?: boolean } & ({ to: string } | { floor: string })
  >;
  variants?: Array<MapVariant>;
};

type InsideEntry = {
  id: string;
  name: string;
  kind: LocationKind;
  size: Size;
  parent: string;
  otherParents?: Array<string>;
  entrances: Array<Rect | { area: Rect; floor: string }>;
  otherEntrances?: Record<string, Array<Rect>>;
  exits?: Array<Rect | { area: Rect; to: string }>;
  cell?: [x: number, y: number];
  floors?: Array<FloorEntry>;
  variants?: Array<MapVariant>;
  marker?: MarkerKind;
};

const inside: Array<InsideEntry> = [
  {
    id: 'oaks-lab',
    name: "Oak's Lab",
    kind: 'building',
    size: [160, 192],
    parent: 'pallet-town',
    entrances: [warp(12, 11)],
    exits: [rect(64, 176, 32, 16)],
    variants: [variant('yellow', 'oaks-lab.png')],
  },
  {
    id: 'viridian-gym',
    name: 'Viridian Gym',
    kind: 'building',
    size: [320, 288],
    parent: 'viridian-city',
    entrances: [warp(32, 7)],
    exits: [rect(256, 272, 32, 16)],
  },
  {
    id: 'pewter-gym',
    name: 'Pewter Gym',
    kind: 'building',
    size: [160, 224],
    parent: 'pewter-city',
    entrances: [warp(16, 17)],
    exits: [rect(64, 208, 32, 16)],
  },
  {
    id: 'pewter-museum',
    name: 'Pewter Museum',
    kind: 'building',
    size: [320, 128],
    parent: 'pewter-city',
    entrances: [warp(14, 7), warp(19, 5)],
    floors: [
      {
        name: '1F',
        exits: [
          { to: 'pewter-city', area: rect(160, 112, 32, 16) },
          { to: 'pewter-city', area: rect(256, 112, 32, 16) },
          { floor: '2F', area: warp(7, 7) },
        ],
      },
      {
        name: '2F',
        size: [224, 128],
        exits: [{ floor: '1F', area: warp(7, 7) }],
      },
    ],
  },
  {
    id: 'viridian-forest',
    name: 'Viridian Forest',
    kind: 'dungeon',
    size: [544, 768],
    parent: 'route-2',
    cell: [2, 4],
    entrances: [],
    exits: [
      { area: rect(16, 0, 32, 16), to: 'route-2/viridian-forest-north-gate' },
      {
        area: rect(240, 752, 64, 16),
        to: 'route-2/viridian-forest-south-gate',
      },
    ],
  },
  {
    id: 'mt-moon',
    name: 'Mt. Moon',
    kind: 'dungeon',
    size: [640, 576],
    parent: 'route-4',
    cell: [6, 2],
    entrances: [entrance(288, 80), { area: warp(24, 5), floor: 'B1F' }],
    floors: [
      {
        name: '1F',
        size: [640, 576],
        exits: [
          { to: 'route-4', area: rect(224, 560, 32, 16) },
          ...[warp(5, 5), warp(17, 11), warp(25, 15)].map((area) => ({
            floor: 'B1F',
            area,
            ladder: true,
          })),
        ],
      },
      {
        name: 'B1F',
        size: [448, 448],
        exits: [
          ...[warp(5, 5), warp(25, 9), warp(25, 15)].map((area) => ({
            floor: '1F',
            area,
            ladder: true,
          })),
          ...[warp(17, 11), warp(21, 17), warp(13, 27), warp(23, 3)].map(
            (area) => ({ floor: 'B2F', area, ladder: true }),
          ),
          { to: 'route-4', area: warp(27, 3), ladder: true },
        ],
      },
      {
        name: 'B2F',
        size: [640, 576],
        exits: [warp(25, 9), warp(21, 17), warp(15, 27), warp(5, 7)].map(
          (area) => ({ floor: 'B1F', area, ladder: true }),
        ),
      },
    ],
  },
  {
    id: 'cerulean-cave',
    name: 'Cerulean Cave',
    kind: 'dungeon',
    size: [480, 288],
    parent: 'cerulean-city',
    entrances: [entrance(64, 176)],
    floors: [
      {
        name: '1F',
        size: [480, 288],
        variants: [variant('yellow', 'cerulean-cave/1f.png')],
      },
      {
        name: '2F',
        size: [480, 288],
        variants: [variant('yellow', 'cerulean-cave/2f.png')],
      },
      {
        name: 'B1F',
        size: [480, 288],
        variants: [variant('yellow', 'cerulean-cave/b1f.png')],
      },
    ],
  },
  {
    id: 'ss-anne',
    name: 'S.S. Anne',
    kind: 'dungeon',
    size: [2000, 2000],
    parent: 'vermilion-city',
    entrances: [rect(284, 492, 40, 24)],
  },
  {
    id: 'digletts-cave',
    name: "Diglett's Cave",
    kind: 'dungeon',
    size: [640, 576],
    parent: 'route-11',
    otherParents: ['route-2'],
    entrances: [],
    exits: [
      { area: warp(5, 5), to: 'route-2/digletts-cave-route-2' },
      { area: warp(37, 31), to: 'route-11/digletts-cave-route-11' },
    ],
  },
  {
    id: 'rock-tunnel',
    name: 'Rock Tunnel',
    kind: 'dungeon',
    size: [640, 576],
    parent: 'route-10',
    cell: [14, 3],
    entrances: [entrance(128, 272), entrance(128, 848)],
    floors: [
      { name: '1F', size: [640, 576] },
      { name: 'B1F', size: [640, 576] },
    ],
  },
  {
    id: 'power-plant',
    name: 'Power Plant',
    kind: 'dungeon',
    size: [640, 576],
    parent: 'route-10',
    entrances: [entrance(96, 624)],
  },
  {
    id: 'pokemon-tower',
    name: 'Pokémon Tower',
    kind: 'building',
    size: [320, 288],
    parent: 'lavender-town',
    entrances: [entrance(224, 80)],
    floors: [
      {
        name: '1F',
        exits: [
          { to: 'lavender-town', area: rect(160, 272, 32, 16) },
          { floor: '2F', area: warp(18, 9) },
        ],
      },
      {
        name: '2F',
        exits: [
          { floor: '3F', area: warp(3, 9) },
          { floor: '1F', area: warp(18, 9) },
        ],
      },
      {
        name: '3F',
        exits: [
          { floor: '2F', area: warp(3, 9) },
          { floor: '4F', area: warp(18, 9) },
        ],
      },
      {
        name: '4F',
        exits: [
          { floor: '5F', area: warp(3, 9) },
          { floor: '3F', area: warp(18, 9) },
        ],
      },
      {
        name: '5F',
        exits: [
          { floor: '4F', area: warp(3, 9) },
          { floor: '6F', area: warp(18, 9) },
        ],
      },
      {
        name: '6F',
        exits: [
          { floor: '5F', area: warp(18, 9) },
          { floor: '7F', area: warp(9, 16) },
        ],
      },
      {
        name: '7F',
        exits: [{ floor: '6F', area: warp(9, 16) }],
      },
    ],
  },
  {
    id: 'rocket-game-corner',
    name: 'Rocket Game Corner',
    kind: 'building',
    size: [320, 288],
    parent: 'celadon-city',
    entrances: [entrance(448, 304)],
    floors: [
      {
        name: 'Game Corner',
        size: [320, 288],
        variants: [variant('yellow', 'rocket-game-corner/game-corner.png')],
      },
      { name: 'B1F', size: [480, 448] },
      { name: 'B2F', size: [480, 448] },
      { name: 'B3F', size: [480, 448] },
      {
        name: 'B4F',
        size: [480, 384],
      },
    ],
  },
  {
    id: 'silph-co',
    name: 'Silph Co.',
    kind: 'building',
    size: [480, 288],
    parent: 'saffron-city',
    entrances: [entrance(288, 336)],
    floors: [
      { name: '1F', size: [480, 288] },
      { name: '2F', size: [480, 288] },
      { name: '3F', size: [480, 288] },
      { name: '4F', size: [480, 288] },
      { name: '5F', size: [480, 288] },
      { name: '6F', size: [416, 288] },
      { name: '7F', size: [416, 288] },
      { name: '8F', size: [416, 288] },
      { name: '9F', size: [416, 288] },
      { name: '10F', size: [256, 288] },
      {
        name: '11F',
        size: [288, 288],
      },
    ],
  },
  {
    id: 'safari-zone',
    name: 'Safari Zone',
    kind: 'dungeon',
    size: [480, 416],
    parent: 'fuchsia-city',
    entrances: [entrance(288, 48)],
    floors: [
      { name: 'Center', size: [480, 416] },
      { name: 'East', size: [480, 416] },
      { name: 'North', size: [640, 576] },
      { name: 'West', size: [480, 416] },
    ],
  },
  {
    id: 'pokemon-mansion',
    name: 'Pokémon Mansion',
    kind: 'building',
    size: [480, 448],
    parent: 'cinnabar-island',
    entrances: [entrance(96, 48)],
    floors: [
      { name: '1F', size: [480, 448] },
      { name: '2F', size: [480, 448] },
      { name: '3F', size: [480, 288] },
      { name: 'B1F', size: [480, 448] },
    ],
  },
  {
    id: 'seafoam-islands',
    name: 'Seafoam Islands',
    kind: 'dungeon',
    size: [480, 288],
    parent: 'route-20',
    cell: [5, 15],
    entrances: [entrance(768, 80), entrance(928, 144)],
    floors: [
      { name: '1F', size: [480, 288] },
      { name: 'B1F', size: [480, 288] },
      { name: 'B2F', size: [480, 288] },
      { name: 'B3F', size: [480, 288] },
      { name: 'B4F', size: [480, 288] },
    ],
  },
  {
    id: 'victory-road',
    name: 'Victory Road',
    kind: 'dungeon',
    size: [320, 288],
    parent: 'route-23',
    cell: [0, 4],
    entrances: [entrance(64, 496)],
    floors: [
      { name: '1F', size: [320, 288] },
      { name: '2F', size: [480, 288] },
      { name: '3F', size: [480, 288] },
    ],
  },
];

const pokemonCenter = (
  id: string,
  parent: string,
  entrances: Array<Rect>,
): InsideEntry => ({
  id,
  name: 'Pokémon Center',
  kind: 'building',
  size: [224, 128],
  parent,
  entrances,
  exits: [rect(48, 112, 32, 16)],
  marker: 'center',
  variants: [variant('yellow', `${id}.png`)],
});

const pokeMart = (
  id: string,
  parent: string,
  entrances: Array<Rect>,
): InsideEntry => ({
  id,
  name: 'Poké Mart',
  kind: 'building',
  size: [128, 128],
  parent,
  entrances,
  exits: [rect(48, 112, 32, 16)],
  marker: 'mart',
  variants: [variant('yellow', `${id}.png`)],
});

const services: Array<InsideEntry> = [
  pokemonCenter('viridian-pokemon-center', 'viridian-city', [warp(23, 25)]),
  pokemonCenter('pewter-pokemon-center', 'pewter-city', [warp(13, 25)]),
  pokemonCenter('cerulean-pokemon-center', 'cerulean-city', [warp(19, 17)]),
  pokemonCenter('lavender-pokemon-center', 'lavender-town', [warp(3, 5)]),
  pokemonCenter('vermilion-pokemon-center', 'vermilion-city', [warp(11, 3)]),
  pokemonCenter('celadon-pokemon-center', 'celadon-city', [warp(41, 9)]),
  pokemonCenter('fuchsia-pokemon-center', 'fuchsia-city', [warp(19, 27)]),
  pokemonCenter('saffron-pokemon-center', 'saffron-city', [warp(9, 29)]),
  pokemonCenter('cinnabar-pokemon-center', 'cinnabar-island', [warp(11, 11)]),
  pokemonCenter('mt-moon-pokemon-center', 'route-4', [warp(11, 5)]),
  pokemonCenter('rock-tunnel-pokemon-center', 'route-10', [warp(11, 19)]),
  pokeMart('viridian-poke-mart', 'viridian-city', [warp(29, 19)]),
  pokeMart('pewter-poke-mart', 'pewter-city', [warp(23, 17)]),
  pokeMart('cerulean-poke-mart', 'cerulean-city', [warp(25, 25)]),
  pokeMart('lavender-poke-mart', 'lavender-town', [warp(15, 13)]),
  pokeMart('vermilion-poke-mart', 'vermilion-city', [warp(23, 13)]),
  pokeMart('fuchsia-poke-mart', 'fuchsia-city', [warp(5, 13)]),
  pokeMart('saffron-poke-mart', 'saffron-city', [warp(25, 11)]),
  pokeMart('cinnabar-poke-mart', 'cinnabar-island', [warp(15, 11)]),
  {
    id: 'indigo-plateau-lobby',
    name: 'Indigo Plateau Lobby',
    kind: 'building',
    size: [256, 192],
    parent: 'indigo-plateau',
    entrances: [rect(140, 76, 40, 24)],
    marker: 'center',
    variants: [variant('yellow', 'indigo-plateau-lobby.png')],
  },
  {
    id: 'celadon-dept-store',
    name: 'Celadon Dept. Store',
    kind: 'building',
    size: [320, 128],
    parent: 'celadon-city',
    entrances: [warp(8, 13), warp(10, 13)],
    marker: 'mart',
    floors: ['1F', '2F', '3F', '4F', '5F', 'Roof'].map((name) => ({ name })),
  },
  {
    id: 'viridian-school-house',
    name: 'Trainer School',
    kind: 'building',
    size: [128, 128],
    parent: 'viridian-city',
    entrances: [warp(21, 15)],
    exits: [rect(32, 112, 32, 16)],
    marker: 'house',
  },
  {
    id: 'viridian-nickname-house',
    name: 'Nickname House',
    kind: 'building',
    size: [128, 128],
    parent: 'viridian-city',
    entrances: [warp(21, 9)],
    exits: [rect(32, 112, 32, 16)],
    marker: 'house',
  },
  {
    id: 'route-2-gate',
    name: 'Route 2 Gate',
    kind: 'building',
    size: [160, 128],
    parent: 'route-2',
    entrances: [warp(16, 35), warp(15, 39)],
    exits: [rect(64, 0, 32, 16), rect(64, 112, 32, 16)],
    marker: 'house',
  },
  {
    id: 'route-2-trade-house',
    name: 'Trade House',
    kind: 'building',
    size: [128, 128],
    parent: 'route-2',
    entrances: [warp(15, 19)],
    exits: [rect(32, 112, 32, 16)],
    marker: 'house',
  },
  {
    id: 'viridian-forest-north-gate',
    name: 'Viridian Forest North Gate',
    kind: 'building',
    size: [160, 128],
    parent: 'route-2',
    entrances: [warp(3, 11)],
    exits: [
      rect(64, 0, 32, 16),
      { area: rect(64, 112, 32, 16), to: 'route-2/viridian-forest' },
    ],
    marker: 'house',
  },
  {
    id: 'viridian-forest-south-gate',
    name: 'Viridian Forest South Gate',
    kind: 'building',
    size: [160, 128],
    parent: 'route-2',
    entrances: [warp(3, 43)],
    exits: [
      { area: rect(64, 0, 32, 16), to: 'route-2/viridian-forest' },
      rect(64, 112, 32, 16),
    ],
    marker: 'house',
  },
  {
    id: 'digletts-cave-route-2',
    name: "Diglett's Cave Entrance",
    kind: 'building',
    size: [128, 128],
    parent: 'route-2',
    entrances: [warp(12, 9)],
    exits: [
      rect(32, 112, 32, 16),
      { area: warp(4, 4), to: 'route-2/digletts-cave' },
    ],
    marker: 'house',
  },
  {
    id: 'digletts-cave-route-11',
    name: "Diglett's Cave Entrance",
    kind: 'building',
    size: [128, 128],
    parent: 'route-11',
    entrances: [warp(4, 5)],
    exits: [
      rect(32, 112, 32, 16),
      { area: warp(4, 4), to: 'route-11/digletts-cave' },
    ],
    marker: 'house',
  },
  {
    id: 'pewter-nidoran-house',
    name: 'Nidoran House',
    kind: 'building',
    size: [128, 128],
    parent: 'pewter-city',
    entrances: [warp(29, 13)],
    exits: [rect(32, 112, 32, 16)],
    marker: 'house',
  },
  {
    id: 'pewter-speech-house',
    name: 'Speech House',
    kind: 'building',
    size: [128, 128],
    parent: 'pewter-city',
    entrances: [warp(7, 29)],
    exits: [rect(32, 112, 32, 16)],
    marker: 'house',
  },
  {
    id: 'reds-house',
    name: "Red's House",
    kind: 'building',
    size: [128, 128],
    parent: 'pallet-town',
    entrances: [warp(5, 5)],
    marker: 'house',
    floors: [
      {
        name: '1F',
        exits: [
          { to: 'pallet-town', area: rect(32, 112, 32, 16) },
          { floor: '2F', area: warp(7, 1) },
        ],
      },
      { name: '2F', exits: [{ floor: '1F', area: warp(7, 1) }] },
    ],
  },
  {
    id: 'blues-house',
    name: "Blue's House",
    kind: 'building',
    size: [128, 128],
    parent: 'pallet-town',
    entrances: [warp(13, 5)],
    exits: [rect(32, 112, 32, 16)],
    marker: 'house',
  },
];

const toLocation = (
  id: string,
  name: string,
  kind: LocationKind,
  [width, height]: Size,
): Location => ({
  id,
  name,
  kind,
  image: `${IMAGE_DIR}/${id}.png`,
  width,
  height,
  pixelated: true,
  source: vgmaps,
  locations: [],
  hotspots: [],
  markers: [],
});

const floorId = (name: string) => name.toLowerCase().replaceAll(' ', '-');

const floorFile = (id: string, floor: string) => `${id}/${floorId(floor)}.png`;

const floorImage = (id: string, floor: string) =>
  `${IMAGE_DIR}/${floorFile(id, floor)}`;

const toInsideLocation = ({
  id,
  name,
  kind,
  size,
  parent,
  exits = [],
  floors,
  variants,
}: InsideEntry): Location => {
  const location = {
    ...toLocation(id, name, kind, size),
    variants,
    hotspots: exits.map((exit) => ({
      ...('to' in exit ? exit.area : exit),
      kind: 'exit' as const,
      target: 'to' in exit ? exit.to : parent,
    })),
  };

  if (!floors) return location;

  return {
    ...location,
    image: floorImage(id, floors[0].name),
    floors: floors.map((floor) => ({
      id: floorId(floor.name),
      name: floor.name,
      image: floorImage(id, floor.name),
      hotspots: (floor.exits ?? []).map(({ area, ladder, ...exit }) => ({
        ...area,
        ...(ladder && { ladder }),
        kind: 'exit' as const,
        ...('to' in exit
          ? { target: exit.to }
          : { target: `${parent}/${id}`, floor: floorId(exit.floor) }),
      })),
      width: floor.size?.[0] ?? location.width,
      height: floor.size?.[1] ?? location.height,
      variants: floor.variants,
      pixelated: location.pixelated,
      source: location.source,
    })),
  };
};

const buildings = [...inside, ...services];

const hotspotsFor = (mapId: string): Array<LocationHotspot> => [
  ...inside.flatMap(({ id, parent, entrances, otherEntrances }) => {
    const rects =
      mapId === parent ? entrances : (otherEntrances?.[mapId] ?? []);

    return rects.map((entry) => ({
      ...('floor' in entry
        ? { ...entry.area, floor: floorId(entry.floor) }
        : entry),
      kind: 'entrance' as const,
      target: `${parent}/${id}`,
    }));
  }),
  ...(connections[mapId] ?? []).map(({ to, direction, area }) => ({
    ...area,
    kind: 'exit' as const,
    target: to,
    travel: direction,
  })),
];

const locations: Array<Location> = outdoor.map(
  ({ id, name, kind, size, markers = [], variants }) => ({
    ...toLocation(id, name, kind, size),
    markers: [
      ...markers,
      ...services
        .filter(({ parent }) => parent === id)
        .flatMap((building) =>
          building.entrances.map((entry) => ({
            ...('area' in entry ? entry.area : entry),
            kind: building.marker ?? 'house',
            name: building.name,
            target: `${building.parent}/${building.id}`,
          })),
        ),
    ],
    variants,
    locations: buildings
      .filter(
        ({ parent, otherParents = [] }) =>
          parent === id || otherParents.includes(id),
      )
      .map((building) =>
        building.parent === id
          ? toInsideLocation(building)
          : {
              ...toInsideLocation(building),
              dataPath: `${building.parent}/${building.id}`,
            },
      ),
    hotspots: hotspotsFor(id),
  }),
);

const cellRect = ([x, y]: [number, number]): Rect =>
  rect(16 + x * 8, 8 + y * 8, 8, 8);

export const kantoRby: Region = {
  id: 'kanto-rby',
  name: 'Kanto',
  versionGroup: 'RBY',
  pokedexSize: 151,
  image: `${IMAGE_DIR}/town-map.png`,
  width: 160,
  height: 144,
  pixelated: true,
  source: {
    name: 'The Spriters Resource',
    url: 'https://www.spriters-resource.com/game_boy_gbc/pokemonredblue/asset/134264/',
    credit: 'FrenchOrange',
  },
  locations,
  tallGrassMap,
  wildAreas: wildAreaData as Array<WildArea>,
  label: {
    x: 8,
    y: 0.5,
    size: 7,
    fontFamily: "'Press Start 2P', monospace",
    color: '#181818',
    uppercase: true,
  },
  cursor: {
    image: '/sprites/rby/town-map-cursor.svg',
    size: 16,
    pixelated: true,
    blink: { visibleMs: 500, hiddenMs: 500 },
  },
  pointer: {
    hover: { frames: ['/sprites/rby/bird-hover.png'] },
    fly: {
      frames: ['/sprites/rby/bird-fly-1.png', '/sprites/rby/bird-fly-2.png'],
      frameMs: 300,
    },
    size: 8,
    pixelated: true,
    source: {
      name: 'The Spriters Resource',
      url: 'https://www.spriters-resource.com/game_boy_gbc/pokemonredblue/asset/8728/',
      credit: 'FrenchOrange',
    },
  },
  hotspots: [
    ...outdoor.map(({ id, cell }) => ({ ...cellRect(cell), target: id })),
    ...inside.flatMap(({ id, parent, cell }) =>
      cell ? [{ ...cellRect(cell), target: `${parent}/${id}` }] : [],
    ),
  ],
};
