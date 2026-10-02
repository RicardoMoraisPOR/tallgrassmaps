import type { NpcGift } from '@/data/npcs/types';

export type TrainerPokemon = {
  number: number;
  level: number;
  moves: Array<string>;
};

export type TrainerParty = {
  label?: string;
  choice?: number;
  pokemon: Array<TrainerPokemon>;
};

export type BattleDialog = {
  label: string;
  text: string;
  gift?: NpcGift;
};

export type SpriteFacing = 'down' | 'up' | 'left' | 'right';

export type TrainerBattle = {
  name: string;
  trainerClass: string;
  path: string;
  area?: string;
  floor?: string;
  x?: number;
  y?: number;
  sprite?: string;
  facing?: SpriteFacing;
  cutscene?: boolean;
  presence?: string;
  dialog?: Array<BattleDialog>;
  choicePrompt?: string;
  games: Array<string>;
  parties: Array<TrainerParty>;
};
