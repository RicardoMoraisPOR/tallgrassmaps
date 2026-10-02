import type { SpriteFacing } from '@/data/trainers/types';

export type NpcGift = {
  name: string;
  sprite: string;
  count?: number;
};

export type NpcPokemon = {
  number: number;
  name: string;
};

export type NpcTrade = {
  give: NpcPokemon;
  receive: NpcPokemon;
};

export type NpcDialog = {
  text: string;
  trigger?: string;
  gift?: NpcGift;
  trade?: NpcTrade;
  pokemon?: NpcPokemon;
};

export type MapNpc = {
  path: string;
  floor?: string;
  x: number;
  y: number;
  name: string;
  sprite: string;
  facing: SpriteFacing;
  spriteOffset?: [x: number, y: number];
  dialog: Array<NpcDialog>;
  cutscene?: boolean;
  presence?: string;
  special?: boolean;
  item?: boolean;
  games: Array<string>;
};
