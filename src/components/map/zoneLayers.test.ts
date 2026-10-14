import { describe, expect, it } from 'vitest';

import { type Location, getRegion } from '@/data/maps';

import { zoneLayerOf, zoneLayersOf } from './zoneLayers';

const region = getRegion('lumiose-za')!;
const targets = region.locations.map(({ id }) => id);

const withSector = {
  ...region,
  locations: [
    ...region.locations,
    { ...region.locations[0], id: 'sector-1', kind: 'sector' } as Location,
  ],
};

describe('zone layers', () => {
  it('puts every Z-A zone in the Wild Zones layer', () => {
    expect(zoneLayerOf(region, 'wild-zone-1')).toBe('wild-zone');
  });

  it('always lists the zone layers, empty ones with a zero count', () => {
    expect(zoneLayersOf(region, targets)).toEqual([
      { id: 'wild-zone', label: 'Wild Zones', count: 20 },
      { id: 'sector', label: 'Sector Zones', count: 0 },
    ]);
  });

  it('counts sector zones once they exist', () => {
    expect(
      zoneLayersOf(withSector, [...targets, 'sector-1']).map(
        ({ count }) => count,
      ),
    ).toEqual([20, 1]);
  });

  it('has no layer for unknown targets', () => {
    expect(zoneLayerOf(region, 'nowhere')).toBeUndefined();
  });
});
