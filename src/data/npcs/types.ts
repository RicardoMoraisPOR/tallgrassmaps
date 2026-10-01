import type { SpriteFacing } from '@/data/trainers/types';

export type NpcGift = {
  name: string;
  sprite: string;
  count?: number;
};

export type NpcTradePokemon = {
  number: number;
  name: string;
};

export type NpcTrade = {
  give: NpcTradePokemon;
  receive: NpcTradePokemon;
};

export type NpcDialog = {
  text: string;
  trigger?: string;
  gift?: NpcGift;
  trade?: NpcTrade;
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
  special?: boolean;
  games: Array<string>;
};
