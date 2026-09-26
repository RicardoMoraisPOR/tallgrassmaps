import { rbyPokedex } from './rby';
import type { PokedexEntry } from './types';

const pokedexes: Partial<Record<string, Array<PokedexEntry>>> = {
  RBY: rbyPokedex,
};

export const pokedexFor = (versionGroup: string) => pokedexes[versionGroup];
