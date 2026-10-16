import { entryRegions, entryShortName, entryVersionGroup } from './entries';
import { generations } from './generations';
import type { MapSet } from './types';

export const mapSets = generations
  .flatMap(({ entries }) => entries)
  .reduce<Array<MapSet>>((sets, entry) => {
    const versionGroup = entryVersionGroup(entry);

    if (!versionGroup) return sets;

    const available = entry.status !== 'coming-soon';
    const game = {
      id: entry.id,
      name: entryShortName(entry),
      color: entry.colors[0],
      available,
    };
    const set = sets.find((other) => other.versionGroup === versionGroup);

    if (set) {
      set.games.push(game);
      set.available ||= available;
    } else {
      sets.push({
        versionGroup,
        regions: entryRegions(entry),
        games: [game],
        available,
      });
    }

    return sets;
  }, []);
