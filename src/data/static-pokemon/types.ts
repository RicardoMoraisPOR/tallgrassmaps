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
  note?: string;
  pokemon: Array<StaticPokemonChoice>;
  games: Array<string>;
};
