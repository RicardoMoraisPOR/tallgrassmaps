import { gamesSharingMap, getGame } from '@/data/games';
import { getSpecies, species } from '@/data/pokedex/master';
import type { PokedexData, PokedexEntry } from '@/data/pokedex/types';
import { rbyTrainers } from '@/data/trainers/rby';
import type { TrainerBattle } from '@/data/trainers/types';

export const findBattle = (
  name: string,
  path: string,
  pokemonCount?: number,
): TrainerBattle =>
  rbyTrainers.find(
    (battle) =>
      battle.name === name &&
      battle.path === path &&
      battle.games.includes('red') &&
      (pokemonCount === undefined ||
        battle.parties[0].pokemon.length === pokemonCount),
  )!;

export const sampleEntry = (
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

export const sampleEntries = (
  gameId: string,
  count: number,
  overrides: Partial<Record<number, Partial<PokedexData>>> = {},
) =>
  species
    .slice(0, count)
    .map((base) => sampleEntry(gameId, base.number, overrides[base.number])!);
