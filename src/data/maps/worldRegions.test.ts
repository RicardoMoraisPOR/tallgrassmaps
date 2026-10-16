import { describe, expect, it } from 'vitest';

import { worldRegions } from './index';
import type { Region } from './types';

const region = (id: string, separateWorld?: boolean) =>
  ({ id, separateWorld }) as Region;

describe('worldRegions', () => {
  const sinnoh = region('sinnoh');
  const johto = region('johto');
  const underground = region('underground', true);
  const all = [sinnoh, johto, underground];

  it('shares one world between the regions that do not ask for their own', () => {
    expect(worldRegions(all, sinnoh)).toEqual([sinnoh, johto]);
    expect(worldRegions(all, johto)).toEqual([sinnoh, johto]);
  });

  it('gives a separate region a world of its own', () => {
    expect(worldRegions(all, underground)).toEqual([underground]);
  });
});
