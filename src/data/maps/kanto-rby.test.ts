import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';

import { kantoRby } from './kanto-rby';
import type { Location } from './types';

const hash = (value: unknown) =>
  createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 12);

const walk = (
  locations: Array<Location>,
  parent = '',
): Array<[string, unknown]> =>
  locations.flatMap((location) => {
    const path = parent ? `${parent}/${location.id}` : location.id;
    const { locations: children, ...rest } = location;

    return [[path, rest], ...walk(children, path)];
  });

describe('kantoRby', () => {
  it('keeps every location unchanged', () => {
    const { locations, ...region } = kantoRby;

    expect({
      region: hash(region),
      locations: Object.fromEntries(
        walk(locations).map(([path, value]) => [path, hash(value)]),
      ),
    }).toMatchSnapshot();
  });
});
