import type {
  Direction,
  Location,
  LocationHotspot,
  LocationKind,
  MapMarker,
  Rect,
  Region,
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

type OutdoorEntry = {
  id: string;
  name: string;
  kind: 'town' | 'route';
  size: Size;
  cell: [x: number, y: number];
  exits?: Array<{ to: string; direction: Direction; area: Rect }>;
  markers?: Array<MapMarker>;
};

const outdoor: Array<OutdoorEntry> = [
  {
    id: 'pallet-town',
    name: 'Pallet Town',
    kind: 'town',
    size: [320, 288],
    cell: [2, 11],
    exits: [
      { to: 'route-1', direction: 'north', area: rect(160, 0, 32, 16) },
      { to: 'route-21', direction: 'south', area: rect(64, 272, 64, 16) },
    ],
  },
  {
    id: 'viridian-city',
    name: 'Viridian City',
    kind: 'town',
    size: [656, 560],
    cell: [2, 8],
  },
  {
    id: 'pewter-city',
    name: 'Pewter City',
    kind: 'town',
    size: [640, 608],
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
    size: [672, 560],
    cell: [10, 9],
  },
  {
    id: 'lavender-town',
    name: 'Lavender Town',
    kind: 'town',
    size: [320, 288],
    cell: [14, 5],
    exits: [
      { to: 'route-10', direction: 'north', area: rect(96, 0, 64, 16) },
      { to: 'route-8', direction: 'west', area: rect(0, 32, 16, 224) },
      { to: 'route-12', direction: 'south', area: rect(128, 272, 32, 16) },
    ],
    markers: [
      { kind: 'center', name: 'Pokémon Center', ...entrance(48, 80) },
      { kind: 'house', name: "Mr. Fuji's House", ...entrance(112, 144) },
      { kind: 'mart', name: 'Poké Mart', ...entrance(240, 208) },
      { kind: 'house', name: 'Cubone House', ...entrance(48, 208) },
      { kind: 'house', name: "Name Rater's House", ...entrance(112, 208) },
    ],
  },
  {
    id: 'celadon-city',
    name: 'Celadon City',
    kind: 'town',
    size: [800, 672],
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
    size: [640, 608],
    cell: [8, 13],
  },
  {
    id: 'cinnabar-island',
    name: 'Cinnabar Island',
    kind: 'town',
    size: [368, 336],
    cell: [2, 15],
  },
  {
    id: 'indigo-plateau',
    name: 'Indigo Plateau',
    kind: 'town',
    size: [176, 272],
    cell: [0, 2],
  },
  {
    id: 'route-1',
    name: 'Route 1',
    kind: 'route',
    size: [368, 576],
    cell: [2, 10],
    exits: [
      { to: 'viridian-city', direction: 'north', area: rect(160, 0, 32, 16) },
      { to: 'pallet-town', direction: 'south', area: rect(160, 560, 32, 16) },
    ],
  },
  {
    id: 'route-2',
    name: 'Route 2',
    kind: 'route',
    size: [464, 1152],
    cell: [2, 6],
  },
  {
    id: 'route-3',
    name: 'Route 3',
    kind: 'route',
    size: [1136, 288],
    cell: [4, 3],
  },
  {
    id: 'route-4',
    name: 'Route 4',
    kind: 'route',
    size: [1440, 320],
    cell: [8, 2],
  },
  {
    id: 'route-5',
    name: 'Route 5',
    kind: 'route',
    size: [432, 576],
    cell: [10, 3],
  },
  {
    id: 'route-6',
    name: 'Route 6',
    kind: 'route',
    size: [464, 576],
    cell: [10, 8],
  },
  {
    id: 'route-7',
    name: 'Route 7',
    kind: 'route',
    size: [288, 352],
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
    size: [960, 320],
    cell: [13, 2],
  },
  {
    id: 'route-10',
    name: 'Route 10',
    kind: 'route',
    size: [320, 1184],
    cell: [14, 4],
  },
  {
    id: 'route-11',
    name: 'Route 11',
    kind: 'route',
    size: [960, 416],
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
    size: [1280, 288],
    cell: [10, 13],
  },
  {
    id: 'route-16',
    name: 'Route 16',
    kind: 'route',
    size: [688, 320],
    cell: [5, 5],
  },
  {
    id: 'route-17',
    name: 'Route 17',
    kind: 'route',
    size: [432, 2304],
    cell: [4, 8],
  },
  {
    id: 'route-18',
    name: 'Route 18',
    kind: 'route',
    size: [848, 336],
    cell: [6, 13],
  },
  {
    id: 'route-19',
    name: 'Route 19',
    kind: 'route',
    size: [320, 944],
    cell: [6, 15],
  },
  {
    id: 'route-20',
    name: 'Route 20',
    kind: 'route',
    size: [1600, 368],
    cell: [4, 15],
  },
  {
    id: 'route-21',
    name: 'Route 21',
    kind: 'route',
    size: [320, 1440],
    cell: [2, 13],
    exits: [
      { to: 'pallet-town', direction: 'north', area: rect(64, 0, 64, 16) },
      {
        to: 'cinnabar-island',
        direction: 'south',
        area: rect(16, 1424, 224, 16),
      },
    ],
  },
  {
    id: 'route-22',
    name: 'Route 22',
    kind: 'route',
    size: [672, 320],
    cell: [0, 8],
  },
  {
    id: 'route-23',
    name: 'Route 23',
    kind: 'route',
    size: [464, 2240],
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
  exits: Array<{ area: Rect } & ({ to: string } | { floor: string })>;
};

type InsideEntry = {
  id: string;
  name: string;
  kind: LocationKind;
  size: Size;
  parent: string;
  entrances: Array<Rect>;
  otherEntrances?: Record<string, Array<Rect>>;
  cell?: [x: number, y: number];
  floors?: Array<FloorEntry>;
};

const inside: Array<InsideEntry> = [
  {
    id: 'viridian-forest',
    name: 'Viridian Forest',
    kind: 'dungeon',
    size: [656, 880],
    parent: 'route-2',
    cell: [2, 4],
    entrances: [entrance(112, 688), entrance(112, 176)],
  },
  {
    id: 'mt-moon',
    name: 'Mt. Moon',
    kind: 'dungeon',
    size: [736, 1824],
    parent: 'route-4',
    cell: [6, 2],
    entrances: [entrance(288, 112)],
  },
  {
    id: 'cerulean-cave',
    name: 'Cerulean Cave',
    kind: 'dungeon',
    size: [731, 1387],
    parent: 'cerulean-city',
    entrances: [entrance(64, 176)],
  },
  {
    id: 'ss-anne',
    name: 'S.S. Anne',
    kind: 'dungeon',
    size: [2000, 2000],
    parent: 'vermilion-city',
    entrances: [rect(316, 492, 40, 24)],
  },
  {
    id: 'digletts-cave',
    name: "Diglett's Cave",
    kind: 'dungeon',
    size: [1146, 629],
    parent: 'route-11',
    entrances: [entrance(64, 144)],
    otherEntrances: { 'route-2': [entrance(256, 144)] },
  },
  {
    id: 'rock-tunnel',
    name: 'Rock Tunnel',
    kind: 'dungeon',
    size: [1445, 640],
    parent: 'route-10',
    cell: [14, 3],
    entrances: [entrance(128, 304), entrance(128, 880)],
  },
  {
    id: 'power-plant',
    name: 'Power Plant',
    kind: 'dungeon',
    size: [752, 688],
    parent: 'route-10',
    entrances: [entrance(96, 656)],
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
      { name: '7F', exits: [{ floor: '6F', area: warp(9, 16) }] },
    ],
  },
  {
    id: 'rocket-game-corner',
    name: 'Rocket Game Corner',
    kind: 'building',
    size: [682, 2308],
    parent: 'celadon-city',
    entrances: [entrance(448, 352)],
  },
  {
    id: 'silph-co',
    name: 'Silph Co.',
    kind: 'building',
    size: [592, 4274],
    parent: 'saffron-city',
    entrances: [entrance(288, 336)],
  },
  {
    id: 'safari-zone',
    name: 'Safari Zone',
    kind: 'dungeon',
    size: [1993, 1391],
    parent: 'fuchsia-city',
    entrances: [entrance(288, 80)],
  },
  {
    id: 'pokemon-mansion',
    name: 'Pokémon Mansion',
    kind: 'building',
    size: [592, 2047],
    parent: 'cinnabar-island',
    entrances: [entrance(144, 48)],
  },
  {
    id: 'seafoam-islands',
    name: 'Seafoam Islands',
    kind: 'dungeon',
    size: [606, 2209],
    parent: 'route-20',
    cell: [5, 15],
    entrances: [entrance(768, 112), entrance(928, 176)],
  },
  {
    id: 'victory-road',
    name: 'Victory Road',
    kind: 'dungeon',
    size: [721, 1372],
    parent: 'route-23',
    cell: [0, 4],
    entrances: [entrance(128, 496)],
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

const floorImage = (id: string, floor: string) =>
  `${IMAGE_DIR}/${id}/${floor.toLowerCase()}.png`;

const toInsideLocation = ({
  id,
  name,
  kind,
  size,
  parent,
  floors,
}: InsideEntry): Location => {
  const location = toLocation(id, name, kind, size);

  if (!floors) return location;

  return {
    ...location,
    image: floorImage(id, floors[0].name),
    floors: floors.map((floor) => ({
      id: floor.name.toLowerCase(),
      name: floor.name,
      image: floorImage(id, floor.name),
      hotspots: floor.exits.map(({ area, ...exit }) => ({
        ...area,
        kind: 'exit' as const,
        ...('to' in exit
          ? { target: exit.to }
          : { target: `${parent}/${id}`, floor: exit.floor.toLowerCase() }),
      })),
      width: location.width,
      height: location.height,
      pixelated: location.pixelated,
      source: location.source,
    })),
  };
};

const hotspotsFor = (mapId: string): Array<LocationHotspot> => [
  ...inside.flatMap(({ id, parent, entrances, otherEntrances }) => {
    const rects =
      mapId === parent ? entrances : (otherEntrances?.[mapId] ?? []);

    return rects.map((area) => ({
      ...area,
      kind: 'entrance' as const,
      target: `${parent}/${id}`,
    }));
  }),
  ...(outdoor
    .find(({ id }) => id === mapId)
    ?.exits?.map(({ to, direction, area }) => ({
      ...area,
      kind: 'exit' as const,
      target: to,
      travel: direction,
    })) ?? []),
];

const locations: Array<Location> = outdoor.map(
  ({ id, name, kind, size, markers = [] }) => ({
    ...toLocation(id, name, kind, size),
    markers,
    locations: inside
      .filter(({ parent }) => parent === id)
      .map(toInsideLocation),
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
