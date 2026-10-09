import wildAreaData from '../kanto-rby-wild.json';
import tallGrassMap from '../tall-grass/kanto-rby.svg?raw';
import type { Rect, Region, WildArea } from '../types';
import { locations } from './build';
import { IMAGE_DIR, rect } from './helpers';
import { inside } from './inside';
import { outdoor } from './outdoor';

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
    note: 'The Kanto Town Map art and the flying bird cursor sprites',
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
