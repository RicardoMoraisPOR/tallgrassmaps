import type { SpriteFacing } from '@/data/trainers/types';

export type NpcDialog = {
  text: string;
  trigger?: string;
};

export type MapNpc = {
  path: string;
  floor?: string;
  x: number;
  y: number;
  name: string;
  sprite: string;
  facing: SpriteFacing;
  dialog: Array<NpcDialog>;
  cutscene?: boolean;
  games: Array<string>;
};
