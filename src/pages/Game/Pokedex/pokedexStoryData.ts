import { games, gamesSharingMap, getGame } from '@/data/games';
import { getRegion } from '@/data/maps';
import { getSpecies, species } from '@/data/pokedex/master';
import type { PokedexData, PokedexEntry } from '@/data/pokedex/types';
import { locationHref } from '@/lib/paths';

import { hasPokedex } from './pokedexViews';

const gameIdsWith = (supports: (versionGroup: string) => boolean) =>
  games
    .filter((game) => {
      const region = getRegion(game.region);

      return (
        region !== undefined &&
        hasPokedex(region) &&
        supports(region.versionGroup)
      );
    })
    .map((game) => game.id);

export const pokedexGameIds = gameIdsWith(() => true);

export const gameIdArgType = {
  control: 'select',
  options: pokedexGameIds,
} as const;

export const pokemonArgType = {
  control: { type: 'number', min: 1, max: species.length },
} as const;

export const pokedexStoryContext = (gameId: string) => {
  const game = getGame(gameId)!;
  const region = getRegion(game.region)!;

  return {
    game,
    region,
    href: (path: string) => locationHref(game.id, path),
    nameOf: (number: number) => getSpecies(number)?.name ?? `#${number}`,
  };
};

export const storyEntry = (
  gameId: string,
  number: number,
  overrides: Partial<PokedexData> = {},
): PokedexEntry | undefined => {
  const base = getSpecies(number);

  return (
    base && {
      ...base,
      id: number,
      games: gamesSharingMap(getGame(gameId)!).map(({ id }) => id),
      encounters: [],
      ...overrides,
    }
  );
};

export const storyEntries = (
  gameId: string,
  count: number,
  overrides: Partial<Record<number, Partial<PokedexData>>> = {},
) =>
  species
    .slice(0, count)
    .map((base) => storyEntry(gameId, base.number, overrides[base.number])!);

export const allTypes = [...new Set(species.flatMap(({ types }) => types))];
