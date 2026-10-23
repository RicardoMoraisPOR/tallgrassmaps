import { gameDataFor } from '../gameData';

export const staticPokemonFor = (versionGroup: string) =>
  gameDataFor(versionGroup)?.staticPokemon;
