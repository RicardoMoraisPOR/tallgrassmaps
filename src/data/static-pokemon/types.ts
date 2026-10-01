import type { SpriteFacing } from '@/data/trainers/types';

export type StaticPokemonChoice = {
  number: number;
  level: number;
};

export type StaticPokemon = {
  path: string;
  floor?: string;
  x: number;
  y: number;
  kind: 'static' | 'gift';
  sprite?: string;
  facing?: SpriteFacing;
  note?: string;
  pokemon: Array<StaticPokemonChoice>;
  games: Array<string>;
};
