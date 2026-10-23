import { describe, expect, it } from 'vitest';

import wild from '@/data/maps/kanto-rby-wild.json';

import { polygonsOf } from './glPolygons';

type Ring = Array<[number, number]>;

describe('polygonsOf', () => {
  it('cuts the Route 23 island out of the surrounding water', () => {
    const water = wild.find(
      ({ path, method }) => path === 'route-23' && method === 'water',
    );
    const polygons = polygonsOf(water?.outline as Array<Ring>);
    const island: Ring = [
      [8, 90],
      [8, 92],
      [10, 92],
      [10, 90],
    ];

    expect(polygons).toHaveLength(1);
    expect(polygons[0]).toHaveLength(2);
    expect(polygons[0][1]).toEqual(island);
  });

  it('keeps separate outer rings as separate polygons', () => {
    const square = (x: number): Ring => [
      [x, 0],
      [x + 2, 0],
      [x + 2, 2],
      [x, 2],
    ];

    expect(polygonsOf([square(0), square(4)])).toEqual([
      [square(0)],
      [square(4)],
    ]);
  });
});
