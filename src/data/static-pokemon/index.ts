import { rbyStaticPokemon } from './rby';
import type { StaticPokemon } from './types';

const staticPokemon: Partial<Record<string, Array<StaticPokemon>>> = {
  RBY: rbyStaticPokemon,
};

export const staticPokemonFor = (versionGroup: string) =>
  staticPokemon[versionGroup];
