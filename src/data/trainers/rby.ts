import data from './rby.json';
import type { TrainerBattle } from './types';

const SPRITES = '/sprites/rby/overworld';

export const rbyTrainers = (data as Array<TrainerBattle>).map((battle) =>
  battle.sprite
    ? { ...battle, sprite: `${SPRITES}/${battle.sprite}.png` }
    : battle,
);
