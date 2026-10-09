import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';

import { games } from '@/data/games';
import { itemsFor } from '@/data/items';
import { inGame, type Location, locationInGame, regions } from '@/data/maps';
import { npcsFor } from '@/data/npcs';
import { signsFor } from '@/data/signs';
import { staticPokemonFor } from '@/data/static-pokemon';
import { trainersFor } from '@/data/trainers';
import { joinPath, locationHref } from '@/lib/paths';

import { locationLinks } from './locationLinks';
import { battleGroups } from './trainerList';

const hash = (value: unknown) =>
  createHash('sha256')
    .update(
      JSON.stringify(value, (_key, entry) =>
        typeof entry === 'function' ? '[function]' : entry,
      ),
    )
    .digest('hex')
    .slice(0, 12);

const walk = (
  locations: Array<Location>,
  parent = '',
): Array<{ location: Location; scope: string }> =>
  locations.flatMap((location) => {
    const scope = joinPath(parent, location.id);

    return [{ location, scope }, ...walk(location.locations, scope)];
  });

const snapshot = () => {
  const result: Record<string, string> = {};

  for (const game of games) {
    const region = regions.find(({ id }) => id === game.region)!;
    const { versionGroup } = region;

    for (const { location: raw, scope } of walk(region.locations)) {
      if (!inGame(raw, game.id)) continue;

      const location = locationInGame(raw, game.id);
      const dataPath = location.dataPath ?? scope;
      const floors = location.floors ?? [undefined];
      const sources = (floorId?: string) => {
        const onThisMap = (marker: {
          path: string;
          floor?: string;
          games: Array<string>;
        }) =>
          marker.path === dataPath &&
          marker.floor === floorId &&
          marker.games.includes(game.id);
        const trainers = trainersFor(versionGroup);

        return {
          items: itemsFor(versionGroup)?.filter(onThisMap),
          itemTooltip: () => 'item',
          trainers: trainers
            ? battleGroups(trainers, {
                game,
                path: dataPath,
                floor: floorId,
                onMapOnly: location.kind === 'town',
              }).flatMap((group) => group.battles)
            : [],
          onSelectTrainer: () => {},
          trainerTooltip: () => 'trainer',
          npcs: npcsFor(versionGroup)?.filter(onThisMap),
          npcTooltip: () => 'npc',
          signs: signsFor(versionGroup)?.filter(onThisMap),
          signTooltip: () => 'sign',
          onOpen: () => {},
          wildAreas:
            region.wildAreas?.filter(
              (area) =>
                area.path === dataPath &&
                area.floor === floorId &&
                inGame(area, game.id),
            ) ?? [],
          wildPopup: () => 'wild',
          staticPokemon: staticPokemonFor(versionGroup)?.filter(onThisMap),
          staticPopup: () => 'static',
        };
      };

      for (const floor of floors) {
        const froms = [
          undefined,
          ...(location.floors ?? []).map(({ id }) => id),
        ];

        for (const from of froms) {
          result[`${game.id}/${scope}/${floor?.id ?? '-'}/${from ?? '-'}`] =
            hash(
              locationLinks(
                region,
                location,
                scope,
                (path) => locationHref(game.id, path),
                game.tileSize,
                floor,
                { ...sources(floor?.id), from },
              ),
            );
        }
      }
    }
  }

  return result;
};

describe('locationLinks', () => {
  it('produces the same links and layer sections for every location', () => {
    const result = snapshot();

    expect(Object.keys(result).length).toBeGreaterThan(500);
    expect(result).toMatchSnapshot();
  });
});
