import { describe, expect, it } from 'vitest';

import { getSpecies } from '@/data/pokedex/master';

import {
  ALL,
  appearancesOf,
  evolutionTree,
  filterSpots,
  formsOf,
  generationOf,
  placesOf,
  spotsOf,
  spriteGroups,
  spritesFor,
} from './pokemonProfile';

describe('generationOf', () => {
  it('places boundary Pokémon in the right generation', () => {
    expect(generationOf(1).id).toBe(1);
    expect(generationOf(151).id).toBe(1);
    expect(generationOf(152).id).toBe(2);
    expect(generationOf(1025).id).toBe(9);
  });
});

describe('appearancesOf', () => {
  it('lists the Kanto games Charmander is in', () => {
    const [kanto] = appearancesOf(4);

    expect(kanto.games.map(({ id }) => id)).toEqual(['red', 'blue', 'yellow']);
  });

  it('is empty for a Pokémon missing from every mapped game', () => {
    expect(appearancesOf(1025)).toEqual([]);
  });
});

describe('evolutionTree', () => {
  it('roots the tree at the first stage from any stage', () => {
    expect(evolutionTree(5)?.number).toBe(4);
    expect(evolutionTree(6)?.number).toBe(4);
  });

  it('branches Eevee into its Kanto evolutions', () => {
    const children = evolutionTree(133)?.children.map(({ number }) => number);

    expect(children).toEqual(expect.arrayContaining([134, 135, 136]));
  });

  it('covers lines outside the mapped games, like Tyrogue', () => {
    const tree = evolutionTree(236);

    expect(tree?.number).toBe(236);
    expect(tree?.children.map(({ number }) => number).toSorted()).toEqual([
      106, 107, 237,
    ]);
    expect(evolutionTree(237)?.number).toBe(236);
  });

  it("starts Pikachu's line at Pichu", () => {
    expect(evolutionTree(26)?.number).toBe(172);
  });

  it('has no tree for a Pokémon without an evolution line', () => {
    expect(evolutionTree(132)).toBeUndefined();
  });
});

describe('formsOf', () => {
  it('pairs each Mega with its stone', () => {
    const forms = formsOf(getSpecies(6)!);

    expect(forms.map(({ stone }) => stone)).toEqual([
      'Charizardite X',
      'Charizardite Y',
    ]);
  });
});

describe('spotsOf', () => {
  const spots = spotsOf(4);

  it('names each place and links it to the game', () => {
    const lab = spots.find(({ label }) => label === "Oak's Lab");

    expect(lab?.link?.to).toBe('/red/pallet-town/oaks-lab');
    expect(lab?.group).toBe('Gift');
  });

  it('filters by game, method and place name', () => {
    expect(
      filterSpots(spots, { game: 'yellow', group: ALL, query: '' }).every(
        ({ games }) => games.some(({ id }) => id === 'yellow'),
      ),
    ).toBe(true);
    expect(
      filterSpots(spots, { game: ALL, group: 'Wild', query: '' }).every(
        ({ group }) => group === 'Wild',
      ),
    ).toBe(true);
    expect(
      filterSpots(spots, { game: ALL, group: ALL, query: 'oak' }).map(
        ({ label }) => label,
      ),
    ).toEqual(["Oak's Lab"]);
  });

  it('groups spots that share a place', () => {
    const places = placesOf([...spots, ...spots]);

    expect(places).toHaveLength(new Set(spots.map(({ key }) => key)).size);
    expect(places.every(({ spots: rows }) => rows.length >= 2)).toBe(true);
  });
});

describe('spot links', () => {
  it('sends a gift to its floor and highlights it on the map', () => {
    const mansion = spotsOf(133).find(
      ({ label }) => label === 'Celadon Mansion',
    );

    expect(mansion?.link).toEqual({
      to: '/red/celadon-city/celadon-mansion?floor=roof-house',
      state: { focusKey: 'static:133' },
    });
  });

  it('lists each cave floor with its own link', () => {
    const floors = spotsOf(19).filter(
      ({ label }) => label === 'Pokémon Mansion',
    );

    expect(floors.map(({ floorLabel }) => floorLabel)).toHaveLength(
      floors.length,
    );
    expect(floors.map(({ link }) => link?.to)).toContain(
      '/yellow/cinnabar-island/pokemon-mansion?floor=1f',
    );
    expect(floors[0].link?.state).toEqual({ focusKey: 'wild:walk' });
  });
});

describe('spritesFor', () => {
  it('lists each source once and merges shared Red and Blue sprites', () => {
    const sources = spritesFor(getSpecies(25)!).map(({ source }) => source);

    expect(sources).toContain('PokeAPI');
    expect(sources).toContain('Red · Blue');
    expect(new Set(sources).size).toBe(sources.length);
  });

  it('groups Mega sprites under their form', () => {
    const groups = spriteGroups(spritesFor(getSpecies(6)!));

    expect(groups.map(({ name }) => name)).toEqual([
      'Base',
      'Mega Charizard X',
      'Mega Charizard Y',
    ]);
    expect(
      groups.find(({ name }) => name === 'Mega Charizard X')?.sprites,
    ).toHaveLength(2);
  });

  it('shows pixel sprites at their native size', () => {
    const sprites = spritesFor(getSpecies(25)!);

    expect(sprites.find(({ source }) => source === 'PokeAPI')?.size).toBe(96);
    expect(sprites.find(({ source }) => source === 'Yellow')?.size).toBe(56);
  });
});
