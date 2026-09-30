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
      kept.push(line.replace(/;.*$/, '').trim());
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
  ROCK_TUNNEL_POKECENTER: 'route-10/rock-tunnel-pokemon-center',
  INDIGO_PLATEAU_LOBBY: 'indigo-plateau/indigo-plateau-lobby',
  CELADON_MART: 'celadon-city/celadon-dept-store',
  VIRIDIAN_GYM: 'viridian-city/viridian-gym',
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
  CERULEAN_GYM: 'cerulean-city',
  CERULEAN_TRADE_HOUSE: 'cerulean-city',
  CERULEAN_MELANIES_HOUSE: 'cerulean-city',
  VERMILION_DOCK: 'vermilion-city',
  VERMILION_TRADE_HOUSE: 'vermilion-city',
  CELADON_MANSION_ROOF_HOUSE: 'celadon-city',
  CINNABAR_LAB_FOSSIL_ROOM: 'cinnabar-island',
  CINNABAR_LAB_TRADE_ROOM: 'cinnabar-island',
  ROUTE_2_TRADE_HOUSE: 'route-2',
  UNDERGROUND_PATH_ROUTE_5: 'route-5',
  ROUTE_11_GATE_2F: 'route-11',
  ROUTE_18_GATE_2F: 'route-18',
  FIGHTING_DOJO: 'saffron-city',
  OAKS_LAB: 'pallet-town',
  PEWTER_GYM: 'pewter-city',
  VERMILION_GYM: 'vermilion-city',
  CELADON_GYM: 'celadon-city',
  FUCHSIA_GYM: 'fuchsia-city',
  SAFFRON_GYM: 'saffron-city',
  CINNABAR_GYM: 'cinnabar-island',
  LORELEIS_ROOM: 'indigo-plateau',
  BRUNOS_ROOM: 'indigo-plateau',
  AGATHAS_ROOM: 'indigo-plateau',
  LANCES_ROOM: 'indigo-plateau',
  CHAMPIONS_ROOM: 'indigo-plateau',
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

const namedFloors = { GAME_CORNER: 'game-corner' };

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
