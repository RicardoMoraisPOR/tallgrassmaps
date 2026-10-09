import { describe, expect, it } from 'vitest';

import { getGame } from '@/data/games';
import { getLocation } from '@/data/maps';
import { kantoRby } from '@/data/maps/kanto-rby';
import { pathSegments } from '@/lib/paths';

import { collectPlaces } from './places';
import { placeMatches, searchPlaces } from './placeSearch';

const places = collectPlaces(kantoRby, getGame('red')!.id);

const parentOf = ({ path }: { path: string }) =>
  getLocation(kantoRby, pathSegments(path).slice(0, -1).join('/'))?.name;

const names = (query: string) =>
  searchPlaces(places, query, parentOf).map(({ location }) => location.name);

describe('searchPlaces', () => {
  it('returns every place for an empty query', () => {
    expect(searchPlaces(places, '  ')).toHaveLength(places.length);
  });

  it('puts exact and prefix matches before looser ones', () => {
    expect(names('route 1')[0]).toBe('Route 1');
  });

  it('ignores case and accents', () => {
    expect(names('PALLET')).toContain('Pallet Town');
    expect(names('poke mart')).toEqual(names('Poké Mart'));
  });

  it('finds buildings by their own name, not the towns around them', () => {
    const found = names('poke mart');

    expect(found.length).toBeGreaterThan(5);
    expect(found.every((name) => name.includes('Mart'))).toBe(true);
  });

  it('matches every word against the name and its parent', () => {
    const results = searchPlaces(places, 'viridian mart', parentOf);

    expect(results).toHaveLength(1);
    expect(parentOf(results[0])).toBe('Viridian City');
  });

  it('does not match a place through its children', () => {
    const town = places.find(
      ({ location }) => location.name === 'Pallet Town',
    )!;

    expect(placeMatches(town, "oak's lab")).toBe(false);
  });
});
