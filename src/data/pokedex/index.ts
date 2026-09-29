import { rbyPokedex } from './rby';
import { zaPokedex } from './za';
import type { PokedexEntry } from './types';

const pokedexes: Partial<Record<string, Array<PokedexEntry>>> = {
  RBY: rbyPokedex,
  ZA: zaPokedex,
};

export const pokedexFor = (versionGroup: string) => pokedexes[versionGroup];
