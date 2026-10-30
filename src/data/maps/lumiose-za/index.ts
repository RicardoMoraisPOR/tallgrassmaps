import type { Hotspot, Location, MapSource, Region } from '../types';
import { wildZoneDoors } from './doors';
import { type Point, wildZoneOutlines } from './outlines';

const spritersResource: MapSource = {
  name: 'The Spriters Resource',
  url: 'https://www.spriters-resource.com/nintendo_switch/pokemonlegendsza/asset/497784/',
  credit: 'Random Talking Bush',
  note: 'The Lumiose City Town Map art',
};

const WILD_ZONE_COLOR = '#49ea82';

const hotspotFor = (target: string, outline: Array<Point>): Hotspot => {
  const xs = outline.map(([x]) => x);
  const ys = outline.map(([, y]) => y);
  const x = Math.min(...xs);
  const y = Math.min(...ys);

  return {
    x,
    y,
    width: Math.max(...xs) - x,
    height: Math.max(...ys) - y,
    shape: outline,
    display: 'always',
    color: WILD_ZONE_COLOR,
    target,
  };
};

const MAP_IMAGE = '/maps/za/town-map.webp';
const MAP_SIZE = 4096;

const wildZoneId = (number: number) => `wild-zone-${number}`;

const wildZoneLocation = (number: number): Location => ({
  id: wildZoneId(number),
  name: `Wild Zone ${number}`,
  kind: 'wild-zone',
  image: MAP_IMAGE,
  width: MAP_SIZE,
  height: MAP_SIZE,
  pixelated: false,
  source: spritersResource,
  doors: wildZoneDoors[number],
  locations: [],
  hotspots: [],
  markers: [],
});

export const lumioseZa: Region = {
  id: 'lumiose-za',
  name: 'Lumiose City',
  partOf: 'Kalos',
  titleFont: "'Michroma', sans-serif",
  versionGroup: 'ZA',
  pokedexSize: 364,
  navigation: 'seamless',
  placeGroups: {
    groups: [
      {
        id: 'wild-zone',
        label: 'Wild Zones',
        singular: 'Wild Zone',
        icon: 'circle',
        kinds: ['wild-zone'],
      },
      {
        id: 'building',
        label: 'Buildings',
        singular: 'Building',
        icon: 'square',
        kinds: ['building', 'landmark'],
      },
      {
        id: 'sector',
        label: 'Sector Zones',
        singular: 'Sector Zone',
        icon: 'diamond',
        kinds: ['sector'],
      },
    ],
  },
  image: MAP_IMAGE,
  width: MAP_SIZE,
  height: MAP_SIZE,
  pixelated: false,
  source: spritersResource,
  locations: wildZoneOutlines.map((_, index) => wildZoneLocation(index + 1)),
  hotspots: wildZoneOutlines.map((outline, index) =>
    hotspotFor(wildZoneId(index + 1), outline),
  ),
};
