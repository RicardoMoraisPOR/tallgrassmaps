export type TrainerPokemon = {
  number: number;
  level: number;
  moves: Array<string>;
};

export type TrainerParty = {
  label?: string;
  pokemon: Array<TrainerPokemon>;
};

export type TrainerBattle = {
  name: string;
  trainerClass: string;
  path: string;
  area?: string;
  floor?: string;
  x?: number;
  y?: number;
  games: Array<string>;
  parties: Array<TrainerParty>;
};
