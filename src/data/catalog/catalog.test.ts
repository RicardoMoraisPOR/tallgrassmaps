import { describe, expect, it } from 'vitest';

import { entryName, entryRegions, entryVersionGroup } from './entries';
import { generations } from './generations';
import { mapSets } from './mapSets';
import { versionGroupNames, versionGroupParts } from './versionGroups';

describe('catalog', () => {
  it('lists every entry per generation', () => {
    expect(
      generations.map(({ number, entries }) => [
        number,
        entries.map((entry) => ({
          id: entry.id,
          name: entryName(entry),
          regions: entryRegions(entry),
          versionGroup: entryVersionGroup(entry),
          status: entry.status,
        })),
      ]),
    ).toMatchSnapshot();
  });

  it('groups games into map sets', () => {
    expect(mapSets).toMatchSnapshot();
  });

  it('names and labels each version group', () => {
    const groups = mapSets.map(({ versionGroup }) => versionGroup);

    expect(
      groups.map((group) => [
        group,
        versionGroupNames(group),
        versionGroupParts(group),
      ]),
    ).toMatchSnapshot();
  });
});
