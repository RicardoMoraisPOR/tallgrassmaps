import { gameDataFor } from '../gameData';

export const pokedexFor = (versionGroup: string) =>
  gameDataFor(versionGroup)?.pokedex;
