import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const VENDOR = fileURLToPath(new URL('../../vendor/', import.meta.url));

const PRET_COMMITS = {
  pokered: 'd2704a63c26f9ba046ade877445216b3de0519a4',
  pokeyellow: 'e89ead154b9968aa50eed9328ff2b38b6c194382',
};

const vendor = async (repo) => {
  const commit = PRET_COMMITS[repo];
  const dir = join(VENDOR, repo);
  const marker = join(dir, '.pret-commit');

  if (existsSync(marker) && readFileSync(marker, 'utf8').trim() === commit) {
    return dir;
  }

  const response = await fetch(
    `https://codeload.github.com/pret/${repo}/tar.gz/${commit}`,
  );

  if (!response.ok) {
    throw new Error(`${response.status} downloading pret/${repo}@${commit}`);
  }

  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  execFileSync('tar', ['-xzf', '-', '--strip-components=1', '-C', dir], {
    input: Buffer.from(await response.arrayBuffer()),
  });
  writeFileSync(marker, `${commit}\n`);

  console.log(
    `Downloaded pret/${repo}@${commit.slice(0, 7)} to vendor/${repo}`,
  );

  return dir;
};

export const pokeredDir = await vendor('pokered');
export const pokeyellowDir = await vendor('pokeyellow');

export const games = [
  { id: 'red', dir: pokeredDir, define: '_RED' },
  { id: 'blue', dir: pokeredDir, define: '_BLUE' },
  { id: 'yellow', dir: pokeyellowDir, define: '_YELLOW' },
];

export const read = (dir, file) => readFileSync(join(dir, file), 'utf8');

export const forGame = (text, define) => {
  const kept = [];
  const stack = [];

  for (const line of text.split('\n')) {
    const condition = line.match(/^\s*IF DEF\((\w+)\)/);

    if (condition) {
      stack.push(condition[1] === define);
    } else if (/^\s*ELSE\b/.test(line)) {
      stack.push(!stack.pop());
    } else if (/^\s*ENDC\b/.test(line)) {
      stack.pop();
    } else if (stack.every(Boolean)) {
      kept.push(line.replace(/;(?=(?:[^"]*"[^"]*")*[^"]*$).*$/, '').trim());
    }
  }

  return kept.filter(Boolean);
};

const insideLocations = {
  VIRIDIAN_POKECENTER: 'viridian-city/viridian-pokemon-center',
  VIRIDIAN_MART: 'viridian-city/viridian-poke-mart',
  PEWTER_POKECENTER: 'pewter-city/pewter-pokemon-center',
  PEWTER_MART: 'pewter-city/pewter-poke-mart',
  CERULEAN_POKECENTER: 'cerulean-city/cerulean-pokemon-center',
  CERULEAN_MART: 'cerulean-city/cerulean-poke-mart',
  LAVENDER_POKECENTER: 'lavender-town/lavender-pokemon-center',
  LAVENDER_MART: 'lavender-town/lavender-poke-mart',
  VERMILION_POKECENTER: 'vermilion-city/vermilion-pokemon-center',
  VERMILION_MART: 'vermilion-city/vermilion-poke-mart',
  CELADON_POKECENTER: 'celadon-city/celadon-pokemon-center',
  FUCHSIA_POKECENTER: 'fuchsia-city/fuchsia-pokemon-center',
  FUCHSIA_MART: 'fuchsia-city/fuchsia-poke-mart',
  SAFFRON_POKECENTER: 'saffron-city/saffron-pokemon-center',
  SAFFRON_MART: 'saffron-city/saffron-poke-mart',
  CINNABAR_POKECENTER: 'cinnabar-island/cinnabar-pokemon-center',
  CINNABAR_MART: 'cinnabar-island/cinnabar-poke-mart',
  MT_MOON_POKECENTER: 'route-4/mt-moon-pokemon-center',
  ROUTE_11_GATE: 'route-11/route-11-gate',
  ROUTE_12_GATE: 'route-12/route-12-gate',
  ROCK_TUNNEL_POKECENTER: 'route-10/rock-tunnel-pokemon-center',
  INDIGO_PLATEAU_LOBBY: 'indigo-plateau/indigo-plateau-lobby',
  CELADON_MART: 'celadon-city/celadon-dept-store',
  VIRIDIAN_GYM: 'viridian-city/viridian-gym',
  PEWTER_GYM: 'pewter-city/pewter-gym',
  MUSEUM: 'pewter-city/pewter-museum',
  VIRIDIAN_FOREST: 'route-2/viridian-forest',
  MT_MOON: 'route-4/mt-moon',
  CERULEAN_CAVE: 'cerulean-city/cerulean-cave',
  SS_ANNE: 'vermilion-city/ss-anne',
  DIGLETTS_CAVE: 'route-11/digletts-cave',
  ROCK_TUNNEL: 'route-10/rock-tunnel',
  POWER_PLANT: 'route-10/power-plant',
  POKEMON_TOWER: 'lavender-town/pokemon-tower',
  ROCKET_HIDEOUT: 'celadon-city/rocket-game-corner',
  GAME_CORNER: 'celadon-city/rocket-game-corner',
  SILPH_CO: 'saffron-city/silph-co',
  SAFARI_ZONE: 'fuchsia-city/safari-zone',
  POKEMON_MANSION: 'cinnabar-island/pokemon-mansion',
  SEAFOAM_ISLANDS: 'route-20/seafoam-islands',
  VICTORY_ROAD: 'route-23/victory-road',
};

const buildingLocations = {
  CERULEAN_GYM: 'cerulean-city/cerulean-gym',
  CERULEAN_TRADE_HOUSE: 'cerulean-city/cerulean-trade-house',
  CERULEAN_MELANIES_HOUSE: 'cerulean-city/cerulean-trade-house',
  VERMILION_DOCK: 'vermilion-city/ss-anne',
  VERMILION_TRADE_HOUSE: 'vermilion-city/vermilion-trade-house',
  CELADON_MANSION_ROOF_HOUSE: 'celadon-city',
  CINNABAR_LAB: 'cinnabar-island/cinnabar-lab',
  CINNABAR_LAB_TRADE_ROOM: 'cinnabar-island/cinnabar-lab',
  CINNABAR_LAB_METRONOME_ROOM: 'cinnabar-island/cinnabar-lab',
  CINNABAR_LAB_FOSSIL_ROOM: 'cinnabar-island/cinnabar-lab',
  ROUTE_2_TRADE_HOUSE: 'route-2/route-2-trade-house',
  UNDERGROUND_PATH_ROUTE_5: 'route-5/underground-path-route-5',
  UNDERGROUND_PATH_ROUTE_6: 'route-6/underground-path-route-6',
  UNDERGROUND_PATH_NORTH_SOUTH: 'route-5/underground-path-north-south',
  ROUTE_7_GATE: 'route-7/route-7-gate',
  ROUTE_22_GATE: 'route-22/route-22-gate',
  UNDERGROUND_PATH_ROUTE_7: 'route-7/underground-path-route-7',
  ROUTE_8_GATE: 'route-8/route-8-gate',
  UNDERGROUND_PATH_ROUTE_8: 'route-8/underground-path-route-8',
  UNDERGROUND_PATH_WEST_EAST: 'route-8/underground-path-west-east',
  ROUTE_12_SUPER_ROD_HOUSE: 'route-12/route-12-super-rod-house',
  MR_FUJIS_HOUSE: 'lavender-town/mr-fujis-house',
  LAVENDER_CUBONE_HOUSE: 'lavender-town/lavender-cubone-house',
  NAME_RATERS_HOUSE: 'lavender-town/name-raters-house',
  SUMMER_BEACH_HOUSE: 'route-19/summer-beach-house',
  ROUTE_18_GATE_2F: 'route-18',
  FIGHTING_DOJO: 'saffron-city',
  OAKS_LAB: 'pallet-town',
  VERMILION_GYM: 'vermilion-city/vermilion-gym',
  CELADON_GYM: 'celadon-city',
  FUCHSIA_GYM: 'fuchsia-city',
  SAFFRON_GYM: 'saffron-city',
  CINNABAR_GYM: 'cinnabar-island/cinnabar-gym',
  LORELEIS_ROOM: 'indigo-plateau/pokemon-league',
  BRUNOS_ROOM: 'indigo-plateau/pokemon-league',
  AGATHAS_ROOM: 'indigo-plateau/pokemon-league',
  LANCES_ROOM: 'indigo-plateau/pokemon-league',
  CHAMPIONS_ROOM: 'indigo-plateau/pokemon-league',
  HALL_OF_FAME: 'indigo-plateau/pokemon-league',
};

const TOWNS = [
  'PALLET_TOWN',
  'VIRIDIAN_CITY',
  'PEWTER_CITY',
  'CERULEAN_CITY',
  'LAVENDER_TOWN',
  'VERMILION_CITY',
  'CELADON_CITY',
  'FUCHSIA_CITY',
  'CINNABAR_ISLAND',
  'INDIGO_PLATEAU',
  'SAFFRON_CITY',
];

export const locationFor = (mapConstant) => {
  if (buildingLocations[mapConstant]) return buildingLocations[mapConstant];
  if (TOWNS.includes(mapConstant))
    return mapConstant.toLowerCase().replaceAll('_', '-');

  const route = mapConstant.match(/^ROUTE_(\d+)$/);

  if (route) return `route-${route[1]}`;

  const inside = insidePrefixFor(mapConstant);

  if (inside) return insideLocations[inside];

  throw new Error(`No location for map ${mapConstant}`);
};

export const insidePrefixFor = (mapConstant) =>
  Object.keys(insideLocations).find((prefix) => mapConstant.startsWith(prefix));

const namedFloors = {
  GAME_CORNER: 'game-corner',
  VERMILION_DOCK: 'dock',
  SS_ANNE_1F_ROOMS: '1f-cabins',
  SS_ANNE_2F_ROOMS: '2f-cabins',
  SS_ANNE_B1F_ROOMS: 'b1f-cabins',
  SS_ANNE_1_F_ROOMS: '1f-cabins',
  SS_ANNE_2_F_ROOMS: '2f-cabins',
  SS_ANNE_B_1_F_ROOMS: 'b1f-cabins',
  SS_ANNE_BOW: 'bow',
  SS_ANNE_KITCHEN: 'kitchen',
  SS_ANNE_CAPTAINS_ROOM: 'captains-room',
  LORELEIS_ROOM: 'loreleis-room',
  BRUNOS_ROOM: 'brunos-room',
  AGATHAS_ROOM: 'agathas-room',
  LANCES_ROOM: 'lances-room',
  CHAMPIONS_ROOM: 'champions-room',
  HALL_OF_FAME: 'hall-of-fame',
  CINNABAR_LAB: 'lobby',
  CINNABAR_LAB_TRADE_ROOM: 'meeting-room',
  CINNABAR_LAB_METRONOME_ROOM: 'rd-room',
  CINNABAR_LAB_FOSSIL_ROOM: 'testing-room',
};

export const floorFor = (mapConstant) => {
  if (namedFloors[mapConstant]) return namedFloors[mapConstant];

  const prefix = mapConstant && insidePrefixFor(mapConstant);

  if (!prefix) return undefined;

  const floor = mapConstant
    .slice(prefix.length)
    .replaceAll('_', '')
    .toLowerCase();

  return /^(b?\d+f|center|east|north|west|roof)$/.test(floor)
    ? floor
    : undefined;
};

export const constantFromFile = (file) =>
  basename(file, '.asm')
    .replace(/_\d+$/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
    .replace(/([a-zA-Z])(\d)/g, '$1_$2')
    .toUpperCase();

const specialNames = {
  NIDORAN_F: 'Nidoran♀',
  NIDORAN_M: 'Nidoran♂',
  MR_MIME: 'Mr. Mime',
  FARFETCHD: "Farfetch'd",
};

export const displayName = (species) =>
  specialNames[species] ?? species.charAt(0) + species.slice(1).toLowerCase();

const MAP_IMAGES = fileURLToPath(
  new URL('../../public/maps/rby/', import.meta.url),
);

const mapKey = (constant) => constant.replaceAll('_', '');

const imageSize = (file) => {
  const header = readFileSync(file);

  return [header.readUInt32BE(16), header.readUInt32BE(20)];
};

const mapSizeCache = new Map();

const mapSizes = (dir) => {
  if (!mapSizeCache.has(dir)) {
    mapSizeCache.set(
      dir,
      new Map(
        [
          ...read(dir, 'constants/map_constants.asm').matchAll(
            /map_const (\w+),\s+(\d+),\s+(\d+)/g,
          ),
        ].map(([, constant, width, height]) => [
          mapKey(constant),
          [Number(width) * 32, Number(height) * 32],
        ]),
      ),
    );
  }

  return mapSizeCache.get(dir);
};

export const siteLocation = (map) => {
  try {
    return locationFor(map);
  } catch {
    return undefined;
  }
};

export const hasOwnMapImage = (dir, map, path, floor, listed = false) => {
  const place = path.split('/').at(-1);
  const image = join(
    MAP_IMAGES,
    floor ? `${place}/${floor}.png` : `${place}.png`,
  );
  const size = mapSizes(dir).get(mapKey(map));
  const ownMap =
    listed ||
    floor ||
    mapKey(map) === mapKey(place.toUpperCase().replaceAll('-', '_'));

  return Boolean(
    ownMap &&
    existsSync(image) &&
    size &&
    imageSize(image).join() === size.join(),
  );
};

export const facings = { DOWN: 'down', UP: 'up', LEFT: 'left', RIGHT: 'right' };

const spriteFile = (dir, file) => join(dir, 'gfx/sprites', file);

const yellowSprites = new Set(
  readdirSync(join(pokeyellowDir, 'gfx/sprites')).filter(
    (file) =>
      !existsSync(spriteFile(pokeredDir, file)) ||
      !readFileSync(spriteFile(pokeyellowDir, file)).equals(
        readFileSync(spriteFile(pokeredDir, file)),
      ),
  ),
);

export const spritePath = (game, sprite) => {
  const name = sprite.toLowerCase();

  return game.id === 'yellow' && yellowSprites.has(`${name}.png`)
    ? `yellow/${name}`
    : name;
};
