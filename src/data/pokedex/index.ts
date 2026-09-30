import { rbyPokedex } from './rby';
import type { PokedexEntry } from './types';
import { zaPokedex } from './za';

const pokedexes: Partial<Record<string, Array<PokedexEntry>>> = {
  RBY: rbyPokedex,
  ZA: zaPokedex,
};

export const pokedexFor = (versionGroup: string) => pokedexes[versionGroup];
