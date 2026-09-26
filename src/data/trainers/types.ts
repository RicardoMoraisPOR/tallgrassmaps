export type TrainerPokemon = {
  number: number;
  level: number;
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
  games: Array<string>;
  parties: Array<TrainerParty>;
};
