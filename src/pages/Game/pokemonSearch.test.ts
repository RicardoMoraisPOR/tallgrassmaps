import { describe, expect, it } from 'vitest';

import { zaPokedex } from '@/data/pokedex/za';

import { searchPokemon } from './pokemonSearch';

const names = (query: string) =>
  searchPokemon(zaPokedex, query).map(({ name }) => name);

describe('searchPokemon', () => {
  it('returns every entry for an empty query', () => {
    expect(searchPokemon(zaPokedex, ' ')).toHaveLength(zaPokedex.length);
  });

  it('matches names ignoring case and accents', () => {
    expect(names('CHARIZ')).toContain('Charizard');
    expect(names('flabebe')).toEqual(names('Flabébé'));
  });

  it('puts exact and prefix matches first', () => {
    expect(names('pika')[0]).toBe('Pikachu');
  });

  it('matches both the game id and the national number', () => {
    const entry = zaPokedex.find(({ id, number }) => id !== number)!;

    expect(searchPokemon(zaPokedex, `#${entry.id}`)).toContain(entry);
    expect(searchPokemon(zaPokedex, String(entry.number))).toContain(entry);
  });
});
