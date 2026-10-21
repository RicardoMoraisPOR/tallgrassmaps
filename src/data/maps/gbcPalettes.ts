type Rgb = [number, number, number];

type Palette = [Rgb, Rgb, Rgb, Rgb];

const WHITE: Rgb = [31, 31, 31];
const WATER: Rgb = [11, 23, 31];
const INK: Rgb = [3, 3, 3];

const yellowArea = (accent: Rgb): Palette => [WHITE, accent, WATER, INK];

export const gbcPalettes = {
  red: [WHITE, [31, 16, 16], [18, 7, 7], [0, 0, 0]],
  blue: [WHITE, [12, 20, 31], [0, 0, 31], [0, 0, 0]],
  redObjects: [WHITE, [15, 31, 6], [0, 16, 0], [0, 0, 0]],
  blueObjects: [WHITE, [31, 16, 16], [18, 7, 7], [0, 0, 0]],
  route: yellowArea([16, 31, 4]),
  pallet: yellowArea([23, 17, 31]),
  viridian: yellowArea([19, 31, 0]),
  pewter: yellowArea([18, 18, 15]),
  cerulean: yellowArea([5, 8, 31]),
  lavender: yellowArea([25, 4, 31]),
  vermilion: yellowArea([31, 19, 0]),
  celadon: yellowArea([5, 31, 5]),
  fuchsia: yellowArea([31, 15, 15]),
  cinnabar: yellowArea([31, 8, 8]),
  indigo: yellowArea([11, 8, 31]),
  saffron: yellowArea([31, 31, 0]),
  cave: [WHITE, [23, 8, 0], [17, 14, 11], INK],
  gray: [WHITE, [20, 23, 10], [11, 11, 5], INK],
} satisfies Record<string, Palette>;

export type GbcPaletteId = keyof typeof gbcPalettes;

const MAX_CHANNEL = 31;

export const paletteColors = (id: GbcPaletteId) =>
  gbcPalettes[id].map((channels) =>
    channels.map((channel) => channel / MAX_CHANNEL),
  );

const TOWN_PALETTES: Record<string, GbcPaletteId> = {
  'pallet-town': 'pallet',
  'viridian-city': 'viridian',
  'pewter-city': 'pewter',
  'cerulean-city': 'cerulean',
  'lavender-town': 'lavender',
  'vermilion-city': 'vermilion',
  'celadon-city': 'celadon',
  'fuchsia-city': 'fuchsia',
  'cinnabar-island': 'cinnabar',
  'indigo-plateau': 'indigo',
  'saffron-city': 'saffron',
};

const CAVES = [
  'mt-moon',
  'rock-tunnel',
  'seafoam-islands',
  'victory-road',
  'digletts-cave',
  'cerulean-cave',
];

const ENTERED_FROM_INDOORS = ['safari-zone', 'underground-path'];

const leagueFloorPalette = (floorId: string | undefined) => {
  if (floorId?.includes('lorelei')) return 'pallet';

  if (floorId?.includes('bruno')) return 'cave';

  if (floorId?.includes('agatha')) return 'gray';

  return undefined;
};

const yellowPalette = (path: string, floorId: string | undefined) => {
  const segments = path.split('/');

  if (segments.includes('pokemon-league')) {
    return leagueFloorPalette(floorId) ?? 'indigo';
  }

  if (segments.includes('pokemon-tower')) return 'gray';

  if (segments.some((segment) => CAVES.includes(segment))) return 'cave';

  if (
    segments.some((segment) =>
      ENTERED_FROM_INDOORS.some((prefix) => segment.startsWith(prefix)),
    )
  ) {
    return 'route';
  }

  return TOWN_PALETTES[segments[0]] ?? 'route';
};

export const hasGbcPalette = (gameId: string) =>
  gameId === 'red' || gameId === 'blue' || gameId === 'yellow';

export const gbcPaletteFor = (
  gameId: string,
  path: string,
  floorId?: string,
  objects = false,
): GbcPaletteId | undefined => {
  if (gameId === 'red') return objects ? 'redObjects' : 'red';

  if (gameId === 'blue') return objects ? 'blueObjects' : 'blue';

  return gameId === 'yellow' ? yellowPalette(path, floorId) : undefined;
};
