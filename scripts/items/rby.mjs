import { readdirSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

import {
  constantFromFile,
  floorFor,
  forGame,
  games,
  hasOwnMapImage,
  mapSteps,
  read,
  siteLocation,
} from '../rby/disassembly.mjs';
import { createReach } from '../rby/reach.mjs';
import { gameTiles } from '../rby/tiles.mjs';

const OUTPUT = new URL('../../src/data/items/rby.json', import.meta.url);

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

const requirementsFor = (game) => {
  const { headers, mapTiles } = gameTiles(game.dir);
  const reach = createReach({ dir: game.dir, headers, mapTiles });
  const levels = [
    { requires: [], steps: reach({ cut: false, surf: false }) },
    { requires: ['Cut'], steps: reach({ cut: true, surf: false }) },
    { requires: ['Surf'], steps: reach({ cut: false, surf: true }) },
    { requires: ['Cut', 'Surf'], steps: reach() },
  ];

  return (map, x, y) => {
    if (!headers[map]) return undefined;

    const tiles = mapTiles(map);
    const around = [
      [0, 0],
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];

    return levels.find(({ steps }) => {
      const reachable = steps(map, tiles);

      return around.some(([dx, dy]) => reachable(x + dx, y + dy));
    })?.requires;
  };
};

const items = [];
const skipped = new Set();

for (const game of games) {
  const machines = machineNames(game);
  const requirementsOf = requirementsFor(game);
  const itemName = (constant) => machines.get(constant) ?? titleCase(constant);
  const addItem = (map, x, y, item, hidden) => {
    const path = siteLocation(map);

    if (!path) {
      skipped.add(map);

      return;
    }

    const floor = floorFor(map);

    if (!hasOwnMapImage(game.dir, map, path, floor)) {
      skipped.add(floor ? `${path} ${floor}` : path);

      return;
    }

    const [columns, rows] = mapSteps(game.dir, map);
    const outside = x >= columns || y >= rows;
    const requires = outside
      ? []
      : (requirementsOf(map, Number(x), Number(y)) ?? []);

    items.push({
      game: game.id,
      path,
      ...(floor && { floor }),
      x: Math.min(Number(x), columns - 1),
      y: Math.min(Number(y), rows - 1),
      item: itemName(item),
      hidden,
      ...(requires.length > 0 && { requires }),
      ...(outside && {
        note: `In the game files but outside the map, so it can't be obtained.`,
      }),
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

    const coins = line.match(
      /^hidden_event\s+(\d+),\s*(\d+), HiddenCoins, COIN \+ (\d+)$/,
    );

    if (header) map = header[1];
    else if (hidden) addItem(map, hidden[1], hidden[2], hidden[3], true);
    else if (coins) addItem(map, coins[1], coins[2], `${coins[3]}_COINS`, true);
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
