import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  constantFromFile,
  floorFor,
  forGame,
  games,
  locationFor,
  read,
} from '../rby/disassembly.mjs';

const OUTPUT = new URL('../../src/data/items/rby.json', import.meta.url);
const MAP_IMAGES = fileURLToPath(
  new URL('../../public/maps/rby/', import.meta.url),
);

const specialWords = { HP: 'HP', PP: 'PP', X: 'X' };

const titleCase = (constant) =>
  constant
    .split('_')
    .map(
      (word) =>
        specialWords[word] ?? word.charAt(0) + word.slice(1).toLowerCase(),
    )
    .join(' ');

const machineNames = (game) => {
  const text = read(game.dir, 'constants/item_constants.asm');
  const names = new Map();

  for (const kind of ['tm', 'hm']) {
    [...text.matchAll(new RegExp(`^\\s*add_${kind} (\\w+)`, 'gm'))].forEach(
      ([, move], index) => {
        names.set(
          `${kind.toUpperCase()}_${move}`,
          `${kind.toUpperCase()}${String(index + 1).padStart(2, '0')} ${titleCase(move)}`,
        );
      },
    );
  }

  return names;
};

const imageSize = (file) => {
  const header = readFileSync(file);

  return [header.readUInt32BE(16), header.readUInt32BE(20)];
};

const mapKey = (constant) => constant.replaceAll('_', '');

const siteLocation = (map) => {
  try {
    return locationFor(map);
  } catch {
    return undefined;
  }
};

const items = [];
const skipped = new Set();

for (const game of games) {
  const machines = machineNames(game);
  const itemName = (constant) => machines.get(constant) ?? titleCase(constant);
  const mapSizes = new Map(
    [
      ...read(game.dir, 'constants/map_constants.asm').matchAll(
        /map_const (\w+),\s+(\d+),\s+(\d+)/g,
      ),
    ].map(([, constant, width, height]) => [
      mapKey(constant),
      [Number(width) * 32, Number(height) * 32],
    ]),
  );

  const addItem = (map, x, y, item, hidden) => {
    const path = siteLocation(map);

    if (!path) {
      skipped.add(map);

      return;
    }

    const floor = floorFor(map);
    const place = path.split('/').at(-1);
    const image = join(
      MAP_IMAGES,
      floor ? `${place}/${floor}.png` : `${place}.png`,
    );
    const size = mapSizes.get(mapKey(map));
    const ownMap =
      floor || mapKey(map) === mapKey(place.toUpperCase().replaceAll('-', '_'));

    if (
      !ownMap ||
      !existsSync(image) ||
      !size ||
      imageSize(image).join() !== size.join()
    ) {
      skipped.add(floor ? `${path} ${floor}` : path);

      return;
    }

    items.push({
      game: game.id,
      path,
      ...(floor && { floor }),
      x: Number(x),
      y: Number(y),
      item: itemName(item),
      hidden,
    });
  };

  for (const fileName of readdirSync(join(game.dir, 'data/maps/objects'))) {
    const text = forGame(
      read(game.dir, `data/maps/objects/${fileName}`),
      game.define,
    ).join('\n');

    for (const [, x, y, item] of text.matchAll(
      /^object_event\s+(\d+),\s*(\d+), SPRITE_POKE_BALL, .*, TEXT_\w+, (\w+)$/gm,
    )) {
      addItem(constantFromFile(basename(fileName, '.asm')), x, y, item, false);
    }
  }

  let map = null;

  for (const line of forGame(
    read(game.dir, 'data/events/hidden_events.asm'),
    game.define,
  )) {
    const header = line.match(/^hidden_events_for (\w+)$/);
    const hidden = line.match(
      /^hidden_event\s+(\d+),\s*(\d+), HiddenItems, (\w+)$/,
    );

    if (header) map = header[1];
    else if (hidden) addItem(map, hidden[1], hidden[2], hidden[3], true);
  }
}

const merged = new Map();

for (const { game, ...item } of items) {
  const key = JSON.stringify(item);
  const current = merged.get(key) ?? { ...item, games: [] };

  current.games.push(game);
  merged.set(key, current);
}

const output = [...merged.values()];

writeFileSync(OUTPUT, `${JSON.stringify(output, null, 2)}\n`);

console.log(`Wrote ${output.length} items to ${OUTPUT.pathname}`);
console.log(
  `Skipped maps whose image does not match the game map size: ${[...skipped].sort().join(', ')}`,
);
