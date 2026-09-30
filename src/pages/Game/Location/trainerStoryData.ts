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
