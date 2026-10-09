import { describe, expect, it } from 'vitest';

import { rbyItems } from '@/data/items/rby';

import { searchItems } from './itemSearch';

describe('searchItems', () => {
  it('returns every item for an empty query', () => {
    expect(searchItems(rbyItems, ' ')).toHaveLength(rbyItems.length);
  });

  it('matches item names ignoring case', () => {
    const found = searchItems(rbyItems, 'POTION');

    expect(found.length).toBeGreaterThan(0);
    expect(found.every(({ item }) => /potion/i.test(item))).toBe(true);
  });

  it('puts exact names before looser matches', () => {
    expect(searchItems(rbyItems, 'potion')[0].item).toBe('Potion');
  });
});
