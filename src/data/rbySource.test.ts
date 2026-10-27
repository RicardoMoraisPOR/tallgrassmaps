import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { rbyItems } from './items/rby';
import { rbyShops } from './shops/rby';
import { rbyTrainers } from './trainers/rby';

const VENDOR = join(import.meta.dirname, '../../vendor');

const games = [
  { id: 'red', dir: join(VENDOR, 'pokered'), define: '_RED' },
  { id: 'blue', dir: join(VENDOR, 'pokered'), define: '_BLUE' },
  { id: 'yellow', dir: join(VENDOR, 'pokeyellow'), define: '_YELLOW' },
];

const SHIFTED_TRAINERS = ['36,4'];
const SCRIPTED_FIGHTERS = ['Blue', 'Jessie & James'];
const HIDDEN_ITEMS_ON_UNUSED_MAPS = 1;

const forGame = (text: string, define: string) => {
  const kept: Array<string> = [];
  const stack: Array<boolean> = [];

  for (const line of text.split('\n')) {
    const condition = line.match(/^\s*IF DEF\((\w+)\)/);

    if (condition) {
      stack.push(condition[1] === define);
    } else if (/^\s*ELSE\b/.test(line)) {
      stack.push(!stack.pop());
    } else if (/^\s*ENDC\b/.test(line)) {
      stack.pop();
    } else if (stack.every(Boolean)) {
      kept.push(line.trim());
    }
  }

  return kept.filter(Boolean);
};

const sourceLines = (game: (typeof games)[number], file: string) =>
  forGame(readFileSync(join(game.dir, file), 'utf8'), game.define);

const objectEvents = (game: (typeof games)[number]) =>
  readdirSync(join(game.dir, 'data/maps/objects')).flatMap((file) =>
    sourceLines(game, `data/maps/objects/${file}`).flatMap((line) => {
      const match = line.match(/^object_event\s+([^;]*)/);

      return match ? [match[1].split(',').map((arg) => arg.trim())] : [];
    }),
  );

const position = (args: Array<string>) => `${args[0]},${args[1]}`;

const counts = (keys: Array<string>) =>
  keys.reduce((map, key) => map.set(key, (map.get(key) ?? 0) + 1), new Map());

const missingFrom = (wanted: Array<string>, actual: Array<string>) => {
  const have = counts(actual);

  return [...counts(wanted)].flatMap(([key, count]) =>
    count > (have.get(key) ?? 0) ? [key] : [],
  );
};

const itemConstant = (name: string) =>
  name
    .replaceAll('é', 'e')
    .replace(/^TM\d+ /, 'TM ')
    .replaceAll('.', '')
    .toUpperCase()
    .replaceAll(' ', '_');

const stockKey = (constants: Array<string>) => constants.toSorted().join();

const referencedMarts = (game: (typeof games)[number]) => {
  const stocks: Array<Array<string>> = [];
  let unused = false;

  for (const line of sourceLines(game, 'data/items/marts.asm')) {
    if (/^\w+::/.test(line)) unused = line.includes('unreferenced');

    const mart = line.match(/^script_mart\s+([^;]*)/);

    if (mart && !unused) {
      stocks.push(mart[1].split(',').map((name) => name.trim()));
    }
  }

  return stocks;
};

const sourcePrices = (game: (typeof games)[number]) => {
  const prices = new Map<string, number>();

  for (const line of sourceLines(game, 'data/items/prices.asm')) {
    const match = line.match(/^bcd3\s+(\d+)\s*;\s*(\w+)/);

    if (match) prices.set(match[2], Number(match[1]));
  }

  for (const line of sourceLines(game, 'data/items/tm_prices.asm')) {
    const match = line.match(/^nybble\s+(\d+)\s*;\s*(TM\d+)/);

    if (match) prices.set(match[2], Number(match[1]) * 1000);
  }

  return prices;
};

describe.skipIf(!existsSync(join(VENDOR, 'pokeyellow')))(
  'RBY data against the pret source',
  () => {
    describe.each(games)('$id', (game) => {
      it('sells exactly what the marts sell', () => {
        const source = referencedMarts(game).map((stock) => stockKey(stock));
        const data = rbyShops
          .filter(({ games: shopGames }) => shopGames.includes(game.id))
          .map(({ stock }) =>
            stockKey(
              stock.map(({ name }) =>
                itemConstant(name).replace(/^TM_/, 'TM_'),
              ),
            ),
          );
        const bicycle = stockKey(['BICYCLE']);

        expect(
          missingFrom(source, data).filter((key) => key !== bicycle),
        ).toEqual([]);
        expect(missingFrom(data, source)).toEqual([]);
      });

      it('prices every stocked item as the game does', () => {
        const prices = sourcePrices(game);
        const wrong = rbyShops
          .filter(({ games: shopGames }) => shopGames.includes(game.id))
          .flatMap(({ stock }) => stock)
          .filter(({ name, price }) => {
            const tm = name.match(/^(TM\d+)/);
            const expected = prices.get(tm ? tm[1] : itemConstant(name));

            return expected !== price;
          })
          .map(({ name }) => name);

        expect(wrong).toEqual([]);
      });

      it('lists every item on the ground', () => {
        const source = objectEvents(game)
          .filter((args) => args[2] === 'SPRITE_POKE_BALL' && args.length === 7)
          .map(position);
        const data = rbyItems
          .filter(
            ({ hidden, games: itemGames }) =>
              !hidden && itemGames.includes(game.id),
          )
          .map(({ x, y }) => `${x},${y}`);

        expect(missingFrom(source, data)).toEqual([]);
        expect(missingFrom(data, source)).toEqual([]);
      });

      it('lists every hidden item and coin', () => {
        const source = sourceLines(
          game,
          'data/events/hidden_events.asm',
        ).filter(
          (line) =>
            /^hidden_event\s+\d+,\s*\d+,\s*HiddenItems,/.test(line) ||
            /^hidden_event\s+\d+,\s*\d+,\s*HiddenCoins,/.test(line),
        );
        const data = rbyItems.filter(
          ({ hidden, games: itemGames }) =>
            hidden && itemGames.includes(game.id),
        );

        expect(data.length).toBe(source.length - HIDDEN_ITEMS_ON_UNUSED_MAPS);
      });

      it('lists every trainer on the map', () => {
        const source = objectEvents(game)
          .filter((args) => args.length >= 8 && args[6].startsWith('OPP_'))
          .map(position);
        const trainers = rbyTrainers.filter(({ games: trainerGames }) =>
          trainerGames.includes(game.id),
        );
        const mapTrainers = trainers
          .filter(({ name }) => !SCRIPTED_FIGHTERS.includes(name))
          .map(({ x, y }) => `${x},${y}`);

        expect(
          missingFrom(
            source,
            trainers.map(({ x, y }) => `${x},${y}`),
          ),
        ).toEqual(SHIFTED_TRAINERS);
        expect(missingFrom(mapTrainers, source)).toEqual([]);
      });
    });

    it('prices items the same in every game', () => {
      expect(sourcePrices(games[2])).toEqual(sourcePrices(games[0]));
    });
  },
);
