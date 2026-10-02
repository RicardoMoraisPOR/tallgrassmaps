import connectionData from './kanto-rby-connections.json';
import wildAreaData from './kanto-rby-wild.json';
import tallGrassMap from './tall-grass/kanto-rby.svg?raw';
import type {
  Direction,
  Location,
  LocationHotspot,
  LocationKind,
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

type FloorExit = {
  area: Rect;
  ladder?: boolean;
  hole?: boolean;
  current?: boolean;
  door?: boolean;
} & ({ to: string } | { floor: string });

type FloorEntry = {
  name: string;
  size?: Size;
  exits?: Array<FloorExit>;
  variants?: Array<MapVariant>;
  games?: Array<string>;
};

const exitTarget = (exit: FloorExit) => ('to' in exit ? exit.to : exit.floor);

const overlaps = (a: Rect, b: Rect) =>
  a.x < b.x + b.width &&
  b.x < a.x + a.width &&
  a.y < b.y + b.height &&
  b.y < a.y + a.height;

const bounds = (a: Rect, b: Rect): Rect => {
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);

  return rect(
    x,
    y,
    Math.max(a.x + a.width, b.x + b.width) - x,
    Math.max(a.y + a.height, b.y + b.height) - y,
  );
};

const mergeHoles = (exits: Array<FloorExit>): Array<FloorExit> => {
  const merged: Array<FloorExit> = [];

  for (const exit of exits) {
    let current = exit;
    const touching = (other: FloorExit) =>
      Boolean(current.hole && other.hole) &&
      exitTarget(other) === exitTarget(current) &&
      overlaps(other.area, current.area);

    for (let index = merged.findIndex(touching); index >= 0;) {
      const [other] = merged.splice(index, 1);

      current = { ...other, area: bounds(other.area, current.area) };
      index = merged.findIndex(touching);
    }

    merged.push(current);
  }

  return merged;
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
  games?: Array<string>;
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
    id: 'cerulean-gym',
    name: 'Cerulean Gym',
    kind: 'building',
    size: [160, 224],
    parent: 'cerulean-city',
    entrances: [warp(30, 19)],
    exits: [rect(64, 208, 32, 16)],
  },
  {
    id: 'underground-path-north-south',
    name: 'Underground Path',
    kind: 'dungeon',
    size: [128, 768],
    parent: 'route-5',
    otherParents: ['route-6'],
    entrances: [],
    exits: [
      { area: warp(5, 4), to: 'route-5/underground-path-route-5' },
      { area: warp(2, 41), to: 'route-6/underground-path-route-6' },
    ],
  },
  {
    id: 'underground-path-west-east',
    name: 'Underground Path',
    kind: 'dungeon',
    size: [800, 128],
    parent: 'route-8',
    otherParents: ['route-7'],
    entrances: [],
    exits: [
      { area: warp(2, 5), to: 'route-7/underground-path-route-7' },
      { area: warp(47, 2), to: 'route-8/underground-path-route-8' },
    ],
  },
  {
    id: 'pokemon-league',
    name: 'Pokémon League',
    kind: 'building',
    size: [160, 192],
    parent: 'indigo-plateau',
    entrances: [],
    floors: [
      {
        name: "Lorelei's Room",
        exits: [
          {
            to: 'indigo-plateau/indigo-plateau-lobby',
            area: rect(64, 176, 32, 16),
          },
          { floor: "Bruno's Room", area: rect(64, 0, 32, 16), door: true },
        ],
      },
      {
        name: "Bruno's Room",
        exits: [
          { floor: "Lorelei's Room", area: rect(64, 176, 32, 16), door: true },
          { floor: "Agatha's Room", area: rect(64, 0, 32, 16), door: true },
        ],
      },
      {
        name: "Agatha's Room",
        exits: [
          { floor: "Bruno's Room", area: rect(64, 176, 32, 16), door: true },
          { floor: "Lance's Room", area: rect(64, 0, 32, 16), door: true },
        ],
      },
      {
        name: "Lance's Room",
        size: [416, 416],
        exits: [
          { floor: "Agatha's Room", area: warp(24, 16) },
          { floor: "Champion's Room", area: rect(80, 0, 32, 16), door: true },
        ],
      },
      {
        name: "Champion's Room",
        size: [128, 128],
        exits: [
          { floor: "Lance's Room", area: rect(48, 112, 32, 16), door: true },
          { floor: 'Hall of Fame', area: rect(48, 0, 32, 16), door: true },
        ],
      },
      {
        name: 'Hall of Fame',
        size: [160, 128],
        exits: [
          { floor: "Champion's Room", area: rect(64, 112, 32, 16), door: true },
        ],
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
        exits: [
          { to: 'cerulean-city', area: rect(384, 272, 32, 16) },
          ...[
            warp(27, 1),
            warp(23, 7),
            warp(18, 9),
            warp(7, 1),
            warp(1, 3),
            warp(3, 11),
          ].map((area) => ({ floor: '2F', area, ladder: true })),
          { floor: 'B1F', area: warp(0, 6), ladder: true },
        ],
      },
      {
        name: '2F',
        size: [480, 288],
        variants: [variant('yellow', 'cerulean-cave/2f.png')],
        exits: [
          warp(29, 1),
          warp(22, 6),
          warp(19, 7),
          warp(9, 1),
          warp(1, 3),
          warp(3, 11),
        ].map((area) => ({ floor: '1F', area, ladder: true })),
      },
      {
        name: 'B1F',
        size: [480, 288],
        variants: [variant('yellow', 'cerulean-cave/b1f.png')],
        exits: [{ floor: '1F', area: warp(3, 6), ladder: true }],
      },
    ],
  },
  {
    id: 'vermilion-gym',
    name: 'Vermilion Gym',
    kind: 'building',
    size: [160, 288],
    parent: 'vermilion-city',
    entrances: [warp(12, 19)],
    exits: [rect(64, 272, 32, 16)],
  },
  {
    id: 'ss-anne',
    name: 'S.S. Anne',
    kind: 'dungeon',
    size: [448, 192],
    parent: 'vermilion-city',
    entrances: [rect(284, 492, 40, 24)],
    floors: [
      {
        name: 'Dock',
        size: [448, 192],
        exits: [
          { to: 'vermilion-city', area: warp(14, 0) },
          { floor: '1F', area: warp(14, 2), door: true },
        ],
      },
      {
        name: '1F',
        size: [640, 288],
        exits: [
          { floor: 'Dock', area: rect(416, 0, 32, 16), door: true },
          ...[
            warp(31, 8),
            warp(23, 8),
            warp(19, 8),
            warp(15, 8),
            warp(11, 8),
            warp(7, 8),
          ].map((area) => ({ floor: '1F Cabins', area, door: true })),
          { floor: '2F', area: warp(2, 6) },
          { floor: 'B1F', area: warp(37, 15) },
          { floor: 'Kitchen', area: warp(3, 16), door: true },
        ],
      },
      {
        name: '1F Cabins',
        size: [384, 256],
        exits: [
          warp(0, 0),
          warp(10, 0),
          warp(20, 0),
          warp(0, 10),
          warp(10, 10),
          warp(20, 10),
        ].map((area) => ({ floor: '1F', area, door: true })),
      },
      {
        name: '2F',
        size: [640, 288],
        exits: [
          ...[
            warp(9, 11),
            warp(13, 11),
            warp(17, 11),
            warp(21, 11),
            warp(25, 11),
            warp(29, 11),
          ].map((area) => ({ floor: '2F Cabins', area, door: true })),
          { floor: '1F', area: warp(2, 4) },
          { floor: '3F', area: warp(2, 12) },
          { floor: "Captain's Room", area: warp(36, 4), door: true },
        ],
      },
      {
        name: '2F Cabins',
        size: [384, 256],
        exits: [
          rect(32, 80, 32, 16),
          rect(192, 80, 32, 16),
          rect(352, 80, 32, 16),
          rect(32, 240, 32, 16),
          rect(192, 240, 32, 16),
          rect(352, 240, 32, 16),
        ].map((area) => ({ floor: '2F', area, door: true })),
      },
      {
        name: '3F',
        size: [320, 96],
        exits: [
          { floor: 'Bow', area: warp(0, 3), door: true },
          { floor: '2F', area: warp(19, 3) },
        ],
      },
      {
        name: 'Bow',
        size: [320, 224],
        exits: [{ floor: '3F', area: rect(208, 96, 16, 32), door: true }],
      },
      {
        name: 'B1F',
        size: [480, 128],
        exits: [
          ...[
            warp(7, 3),
            warp(11, 3),
            warp(15, 3),
            warp(19, 3),
            warp(23, 3),
          ].map((area) => ({ floor: 'B1F Cabins', area, door: true })),
          { floor: '1F', area: warp(27, 5) },
        ],
      },
      {
        name: 'B1F Cabins',
        size: [384, 256],
        exits: [
          rect(32, 80, 32, 16),
          rect(192, 80, 32, 16),
          rect(352, 80, 32, 16),
          rect(32, 240, 32, 16),
          rect(192, 240, 32, 16),
        ].map((area) => ({ floor: 'B1F', area, door: true })),
      },
      {
        name: 'Kitchen',
        size: [224, 256],
        exits: [{ floor: '1F', area: warp(6, 0), door: true }],
      },
      {
        name: "Captain's Room",
        size: [96, 128],
        exits: [{ floor: '2F', area: warp(0, 7), door: true }],
      },
    ],
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
      {
        name: '1F',
        size: [640, 576],
        exits: [
          { to: 'route-10', area: warp(15, 3), ladder: true },
          { to: 'route-10', area: warp(15, 33), ladder: true },
          ...[warp(37, 3), warp(5, 3), warp(17, 11), warp(37, 17)].map(
            (area) => ({ floor: 'B1F', area, ladder: true }),
          ),
        ],
      },
      {
        name: 'B1F',
        size: [640, 576],
        exits: [warp(33, 25), warp(27, 3), warp(23, 11), warp(3, 3)].map(
          (area) => ({ floor: '1F', area, ladder: true }),
        ),
      },
    ],
  },
  {
    id: 'power-plant',
    name: 'Power Plant',
    kind: 'dungeon',
    size: [640, 576],
    parent: 'route-10',
    entrances: [entrance(96, 624)],
    exits: [rect(64, 560, 32, 16), rect(0, 176, 16, 16)],
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
      {
        name: '1F',
        size: [480, 448],
        exits: [
          { to: 'cinnabar-island', area: rect(64, 432, 64, 16) },
          { to: 'cinnabar-island', area: rect(416, 432, 32, 16) },
          { floor: '2F', area: warp(5, 10) },
          { floor: 'B1F', area: warp(21, 23) },
        ],
      },
      {
        name: '2F',
        size: [480, 448],
        exits: [
          { floor: '1F', area: warp(5, 10) },
          ...[warp(7, 10), warp(25, 14), warp(6, 1)].map((area) => ({
            floor: '3F',
            area,
          })),
        ],
      },
      {
        name: '3F',
        size: [480, 288],
        exits: [
          ...[warp(7, 10), warp(25, 14), warp(6, 1)].map((area) => ({
            floor: '2F',
            area,
          })),
          ...[warp(16, 14), warp(17, 14)].map((area) => ({
            floor: '1F',
            area,
            hole: true,
          })),
          { floor: '2F', area: warp(19, 14), hole: true },
        ],
      },
      {
        name: 'B1F',
        size: [480, 448],
        exits: [{ floor: '1F', area: warp(23, 22) }],
      },
    ],
  },
  {
    id: 'cinnabar-gym',
    name: 'Cinnabar Gym',
    kind: 'building',
    size: [320, 288],
    parent: 'cinnabar-island',
    entrances: [warp(18, 3)],
    exits: [rect(256, 272, 32, 16)],
  },
  {
    id: 'cinnabar-lab',
    name: 'Pokémon Lab',
    kind: 'building',
    size: [288, 128],
    parent: 'cinnabar-island',
    entrances: [warp(6, 9)],
    floors: [
      {
        name: 'Lobby',
        exits: [
          { to: 'cinnabar-island', area: rect(32, 112, 32, 16) },
          { floor: 'Meeting Room', area: warp(8, 4), door: true },
          { floor: 'R&D Room', area: warp(12, 4), door: true },
          { floor: 'Testing Room', area: warp(16, 4), door: true },
        ],
      },
      ...['Meeting Room', 'R&D Room', 'Testing Room'].map((name) => ({
        name,
        size: [128, 128] as Size,
        exits: [{ floor: 'Lobby', area: rect(32, 112, 32, 16), door: true }],
      })),
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
      {
        name: '1F',
        exits: [
          { to: 'route-20', area: rect(64, 272, 32, 16) },
          { to: 'route-20', area: rect(416, 272, 32, 16) },
          ...[warp(7, 5), warp(25, 3), warp(23, 15)].map((area) => ({
            floor: 'B1F',
            area,
            ladder: true,
          })),
          ...[warp(17, 6), warp(24, 6)].map((area) => ({
            floor: 'B1F',
            area,
            hole: true,
          })),
        ],
      },
      {
        name: 'B1F',
        exits: [
          ...[warp(7, 5), warp(25, 3), warp(23, 15)].map((area) => ({
            floor: '1F',
            area,
            ladder: true,
          })),
          ...[warp(4, 2), warp(13, 7), warp(19, 15), warp(25, 11)].map(
            (area) => ({ floor: 'B2F', area, ladder: true }),
          ),
          ...[warp(18, 6), warp(23, 6)].map((area) => ({
            floor: 'B2F',
            area,
            hole: true,
          })),
        ],
      },
      {
        name: 'B2F',
        exits: [
          ...[warp(5, 3), warp(13, 7), warp(19, 15), warp(25, 11)].map(
            (area) => ({ floor: 'B1F', area, ladder: true }),
          ),
          ...[warp(5, 13), warp(25, 3), warp(25, 14)].map((area) => ({
            floor: 'B3F',
            area,
            ladder: true,
          })),
          ...[warp(19, 6), warp(22, 6)].map((area) => ({
            floor: 'B3F',
            area,
            hole: true,
          })),
        ],
      },
      {
        name: 'B3F',
        exits: [
          ...[warp(5, 12), warp(25, 3), warp(25, 14)].map((area) => ({
            floor: 'B2F',
            area,
            ladder: true,
          })),
          ...[warp(8, 6), warp(25, 4)].map((area) => ({
            floor: 'B4F',
            area,
            ladder: true,
          })),
          { floor: 'B4F', area: rect(320, 272, 32, 16), current: true },
          ...[warp(3, 16), warp(6, 16)].map((area) => ({
            floor: 'B4F',
            area,
            hole: true,
          })),
        ],
      },
      {
        name: 'B4F',
        exits: [
          ...[warp(11, 7), warp(25, 4)].map((area) => ({
            floor: 'B3F',
            area,
            ladder: true,
          })),
          { floor: 'B3F', area: rect(320, 272, 32, 16), current: true },
        ],
      },
    ],
  },
  {
    id: 'victory-road',
    name: 'Victory Road',
    kind: 'dungeon',
    size: [320, 288],
    parent: 'route-23',
    cell: [0, 4],
    entrances: [entrance(64, 496), { area: warp(14, 31), floor: '2F' }],
    floors: [
      {
        name: '1F',
        size: [320, 288],
        exits: [
          { to: 'route-23', area: rect(128, 272, 32, 16) },
          { floor: '2F', area: warp(1, 1), ladder: true },
        ],
      },
      {
        name: '2F',
        size: [480, 288],
        exits: [
          { floor: '1F', area: warp(0, 8), ladder: true },
          { to: 'route-23', area: rect(464, 112, 16, 32) },
          ...[warp(23, 7), warp(27, 7), warp(25, 14), warp(1, 1)].map(
            (area) => ({ floor: '3F', area, ladder: true }),
          ),
        ],
      },
      {
        name: '3F',
        size: [480, 288],
        exits: [warp(23, 7), warp(26, 8), warp(27, 15), warp(2, 0)].map(
          (area) => ({ floor: '2F', area, ladder: true }),
        ),
      },
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
    exits: [
      rect(112, 176, 32, 16),
      { area: warp(8, 0), to: 'indigo-plateau/pokemon-league' },
    ],
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
    id: 'route-22-gate',
    name: 'Route 22 Gate',
    kind: 'building',
    size: [160, 128],
    parent: 'route-22',
    otherParents: ['route-23'],
    entrances: [warp(8, 5)],
    otherEntrances: { 'route-23': [warp(7, 139)] },
    exits: [
      rect(64, 112, 32, 16),
      { area: rect(64, 0, 32, 16), to: 'route-23' },
    ],
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
    id: 'route-11-gate',
    name: 'Route 11 Gate',
    kind: 'building',
    size: [128, 160],
    parent: 'route-11',
    entrances: [warp(49, 8), warp(58, 8)],
    marker: 'house',
    floors: [
      {
        name: '1F',
        exits: [
          { to: 'route-11', area: rect(0, 64, 16, 32) },
          { to: 'route-11', area: rect(112, 64, 16, 32) },
          { floor: '2F', area: warp(6, 8) },
        ],
      },
      {
        name: '2F',
        size: [128, 128],
        exits: [{ floor: '1F', area: warp(7, 7) }],
      },
    ],
  },
  {
    id: 'route-12-gate',
    name: 'Route 12 Gate',
    kind: 'building',
    size: [160, 128],
    parent: 'route-12',
    entrances: [warp(10, 15), warp(10, 21)],
    marker: 'house',
    floors: [
      {
        name: '1F',
        exits: [
          { to: 'route-12', area: rect(64, 0, 32, 16) },
          { to: 'route-12', area: rect(64, 112, 32, 16) },
          { floor: '2F', area: warp(8, 6) },
        ],
      },
      {
        name: '2F',
        size: [128, 128],
        exits: [{ floor: '1F', area: warp(7, 7) }],
      },
    ],
  },
  {
    id: 'route-12-super-rod-house',
    name: 'Super Rod House',
    kind: 'building',
    size: [128, 128],
    parent: 'route-12',
    entrances: [warp(11, 77)],
    exits: [rect(32, 112, 32, 16)],
    marker: 'house',
  },
  {
    id: 'mr-fujis-house',
    name: "Mr. Fuji's House",
    kind: 'building',
    size: [128, 128],
    parent: 'lavender-town',
    entrances: [warp(7, 9)],
    exits: [rect(32, 112, 32, 16)],
    marker: 'house',
  },
  {
    id: 'lavender-cubone-house',
    name: 'Cubone House',
    kind: 'building',
    size: [128, 128],
    parent: 'lavender-town',
    entrances: [warp(3, 13)],
    exits: [rect(32, 112, 32, 16)],
    marker: 'house',
  },
  {
    id: 'name-raters-house',
    name: "Name Rater's House",
    kind: 'building',
    size: [128, 128],
    parent: 'lavender-town',
    entrances: [warp(7, 13)],
    exits: [rect(32, 112, 32, 16)],
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
    id: 'cerulean-trade-house',
    name: 'Trade House',
    kind: 'building',
    size: [128, 128],
    parent: 'cerulean-city',
    entrances: [warp(13, 15)],
    exits: [rect(32, 112, 32, 16)],
    marker: 'house',
  },
  {
    id: 'bike-shop',
    name: 'Bike Shop',
    kind: 'building',
    size: [128, 128],
    parent: 'cerulean-city',
    entrances: [warp(13, 25)],
    exits: [rect(32, 112, 32, 16)],
    marker: 'house',
  },
  {
    id: 'cerulean-badge-house',
    name: 'Badge House',
    kind: 'building',
    size: [128, 128],
    parent: 'cerulean-city',
    entrances: [warp(9, 11), warp(9, 9)],
    exits: [rect(32, 112, 32, 16), warp(2, 0)],
    marker: 'house',
  },
  {
    id: 'cerulean-trashed-house',
    name: 'Robbed House',
    kind: 'building',
    size: [128, 128],
    parent: 'cerulean-city',
    entrances: [warp(27, 11), warp(27, 9)],
    exits: [rect(32, 112, 32, 16), warp(3, 0)],
    marker: 'house',
  },
  {
    id: 'bills-house',
    name: "Bill's House",
    kind: 'building',
    size: [128, 128],
    parent: 'route-25',
    entrances: [warp(45, 3)],
    exits: [rect(32, 112, 32, 16)],
    marker: 'house',
  },
  {
    id: 'route-5-gate',
    name: 'Route 5 Gate',
    kind: 'building',
    size: [128, 96],
    parent: 'route-5',
    entrances: [warp(10, 29), warp(10, 33)],
    exits: [rect(48, 0, 32, 16), rect(48, 80, 32, 16)],
    marker: 'house',
  },
  {
    id: 'underground-path-route-5',
    name: 'Underground Path Entrance',
    kind: 'building',
    size: [128, 128],
    parent: 'route-5',
    entrances: [warp(17, 27)],
    exits: [
      rect(48, 112, 32, 16),
      { area: warp(4, 4), to: 'route-5/underground-path-north-south' },
    ],
    marker: 'house',
  },
  {
    id: 'route-6-gate',
    name: 'Route 6 Gate',
    kind: 'building',
    size: [128, 96],
    parent: 'route-6',
    entrances: [warp(10, 1), warp(10, 7)],
    exits: [rect(48, 0, 32, 16), rect(48, 80, 32, 16)],
    marker: 'house',
  },
  {
    id: 'underground-path-route-6',
    name: 'Underground Path Entrance',
    kind: 'building',
    size: [128, 128],
    parent: 'route-6',
    entrances: [warp(17, 13)],
    exits: [
      rect(48, 112, 32, 16),
      { area: warp(4, 4), to: 'route-6/underground-path-north-south' },
    ],
    marker: 'house',
  },
  {
    id: 'route-7-gate',
    name: 'Route 7 Gate',
    kind: 'building',
    size: [96, 128],
    parent: 'route-7',
    entrances: [warp(18, 9), warp(11, 9)],
    exits: [rect(80, 48, 16, 32), rect(0, 48, 16, 32)],
    marker: 'house',
  },
  {
    id: 'underground-path-route-7',
    name: 'Underground Path Entrance',
    kind: 'building',
    size: [128, 128],
    parent: 'route-7',
    entrances: [warp(5, 13)],
    exits: [
      rect(48, 112, 32, 16),
      { area: warp(4, 4), to: 'route-7/underground-path-west-east' },
    ],
    marker: 'house',
  },
  {
    id: 'route-8-gate',
    name: 'Route 8 Gate',
    kind: 'building',
    size: [96, 128],
    parent: 'route-8',
    entrances: [warp(1, 9), warp(8, 9)],
    exits: [rect(0, 48, 16, 32), rect(80, 48, 16, 32)],
    marker: 'house',
  },
  {
    id: 'underground-path-route-8',
    name: 'Underground Path Entrance',
    kind: 'building',
    size: [128, 128],
    parent: 'route-8',
    entrances: [warp(13, 3)],
    exits: [
      rect(48, 112, 32, 16),
      { area: warp(4, 4), to: 'route-8/underground-path-west-east' },
    ],
    marker: 'house',
  },
  {
    id: 'daycare',
    name: 'Day Care',
    kind: 'building',
    size: [128, 128],
    parent: 'route-5',
    entrances: [warp(10, 21)],
    exits: [rect(32, 112, 32, 16)],
    marker: 'house',
  },
  {
    id: 'vermilion-trade-house',
    name: 'Trade House',
    kind: 'building',
    size: [128, 128],
    parent: 'vermilion-city',
    entrances: [warp(15, 13)],
    exits: [rect(32, 112, 32, 16)],
    marker: 'house',
  },
  {
    id: 'pokemon-fan-club',
    name: 'Pokémon Fan Club',
    kind: 'building',
    size: [128, 128],
    parent: 'vermilion-city',
    entrances: [warp(9, 13)],
    exits: [rect(32, 112, 32, 16)],
    marker: 'house',
  },
  {
    id: 'vermilion-pidgey-house',
    name: 'Pidgey House',
    kind: 'building',
    size: [128, 128],
    parent: 'vermilion-city',
    entrances: [warp(23, 19)],
    exits: [rect(32, 112, 32, 16)],
    marker: 'house',
  },
  {
    id: 'vermilion-old-rod-house',
    name: 'Old Rod House',
    kind: 'building',
    size: [128, 128],
    parent: 'vermilion-city',
    entrances: [warp(7, 3)],
    exits: [rect(32, 112, 32, 16)],
    marker: 'house',
  },
  {
    id: 'summer-beach-house',
    name: 'Summer Beach House',
    kind: 'building',
    size: [224, 128],
    parent: 'route-19',
    entrances: [warp(5, 9)],
    exits: [rect(32, 112, 32, 16)],
    marker: 'house',
    games: ['yellow'],
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

const floorId = (name: string) =>
  name
    .toLowerCase()
    .replaceAll(' ', '-')
    .replace(/[^a-z0-9-]/g, '');

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
  games,
}: InsideEntry): Location => {
  const location = {
    ...toLocation(id, name, kind, size),
    variants,
    ...(games && { games }),
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
      hotspots: mergeHoles(floor.exits ?? []).map(
        ({ area, ladder, hole, current, door, ...exit }) => ({
          ...area,
          ...(ladder && { ladder }),
          ...(hole && { hole }),
          ...(current && { current }),
          ...(door && { door }),
          kind: 'exit' as const,
          ...('to' in exit
            ? { target: exit.to }
            : { target: `${parent}/${id}`, floor: floorId(exit.floor) }),
        }),
      ),
      width: floor.size?.[0] ?? location.width,
      height: floor.size?.[1] ?? location.height,
      variants: floor.variants,
      ...(floor.games && { games: floor.games }),
      pixelated: location.pixelated,
      source: location.source,
    })),
  };
};

const buildings = [...inside, ...services];

const hotspotsFor = (mapId: string): Array<LocationHotspot> => [
  ...inside.flatMap(({ id, parent, entrances, otherEntrances, games }) => {
    const rects =
      mapId === parent ? entrances : (otherEntrances?.[mapId] ?? []);

    return rects.map((entry) => ({
      ...('floor' in entry
        ? { ...entry.area, floor: floorId(entry.floor) }
        : entry),
      kind: 'entrance' as const,
      target: `${parent}/${id}`,
      ...(games && { games }),
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
  ({ id, name, kind, size, variants }) => ({
    ...toLocation(id, name, kind, size),
    markers: services.flatMap((building) =>
      (building.parent === id
        ? building.entrances
        : (building.otherEntrances?.[id] ?? [])
      ).map((entry) => ({
        ...('area' in entry ? entry.area : entry),
        kind: building.marker ?? 'house',
        name: building.name,
        target: `${id}/${building.id}`,
        ...(building.games && { games: building.games }),
      })),
    ),
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
