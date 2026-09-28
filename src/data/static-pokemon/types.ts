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
  pokemon: Array<StaticPokemonChoice>;
  games: Array<string>;
};
