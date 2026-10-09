import { describe, expect, it } from 'vitest';

import { getGame } from '@/data/games';
import { kantoRby } from '@/data/maps/kanto-rby';

import { collectPlaces } from './places';
import { placeMatches, searchPlaces } from './placeSearch';

const places = collectPlaces(kantoRby, getGame('red')!.id);

describe('searchPlaces', () => {
  it('returns every place for an empty query', () => {
    expect(searchPlaces(places, '  ')).toHaveLength(places.length);
  });

  it('puts exact and prefix matches before looser ones', () => {
    const names = searchPlaces(places, 'route 1').map(
      ({ location }) => location.name,
    );

    expect(names[0]).toBe('Route 1');
  });

  it('ignores case and accents', () => {
    expect(
      searchPlaces(places, 'PALLET').some(
        ({ location }) => location.name === 'Pallet Town',
      ),
    ).toBe(true);
    expect(placeMatches(places[0], 'pokémon')).toBe(
      placeMatches(places[0], 'pokemon'),
    );
  });

  it('finds a town through the buildings inside it', () => {
    const town = places.find(
      ({ location }) => location.name === 'Pallet Town',
    )!;

    expect(placeMatches(town, "oak's lab")).toBe(true);
  });
});
