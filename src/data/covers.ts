import type { MapSource } from './maps';

export const coverSources = {
  libretro: {
    name: 'libretro-thumbnails',
    url: 'https://github.com/libretro-thumbnails',
    credit: 'the libretro community',
  },
  thegamesdb: {
    name: 'TheGamesDB',
    url: 'https://thegamesdb.net/',
    credit: 'TheGamesDB contributors',
  },
} satisfies Record<string, MapSource>;

type CoverSource = keyof typeof coverSources;

const COVERS: Record<string, CoverSource> = {
  red: 'libretro',
  blue: 'libretro',
  yellow: 'libretro',
  gold: 'libretro',
  silver: 'libretro',
  crystal: 'libretro',
  ruby: 'libretro',
  sapphire: 'libretro',
  emerald: 'libretro',
  firered: 'libretro',
  leafgreen: 'libretro',
  diamond: 'libretro',
  pearl: 'libretro',
  platinum: 'libretro',
  heartgold: 'libretro',
  soulsilver: 'libretro',
  black: 'libretro',
  white: 'libretro',
  'black-2': 'libretro',
  'white-2': 'libretro',
  x: 'libretro',
  y: 'libretro',
  'omega-ruby': 'libretro',
  'alpha-sapphire': 'libretro',
  sun: 'libretro',
  moon: 'libretro',
  'ultra-sun': 'libretro',
  'ultra-moon': 'libretro',
  'lets-go-pikachu': 'thegamesdb',
  'lets-go-eevee': 'thegamesdb',
  sword: 'thegamesdb',
  shield: 'thegamesdb',
  'brilliant-diamond': 'thegamesdb',
  'shining-pearl': 'thegamesdb',
  'legends-arceus': 'thegamesdb',
  scarlet: 'thegamesdb',
  violet: 'thegamesdb',
  'legends-za': 'thegamesdb',
};

export const getCover = (gameId: string) =>
  Object.hasOwn(COVERS, gameId) ? `/covers/${gameId}.webp` : undefined;

export const coverCount = (source: CoverSource) =>
  Object.values(COVERS).filter((other) => other === source).length;
