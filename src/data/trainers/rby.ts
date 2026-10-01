import data from './rby.json';
import type { TrainerBattle } from './types';

const SPRITES = '/sprites/rby/overworld';

export const rbyTrainers = (data as Array<TrainerBattle>).map((battle) => ({
  ...battle,
  ...(battle.sprite && { sprite: `${SPRITES}/${battle.sprite}.png` }),
  ...(battle.dialog && {
    dialog: battle.dialog.map((entry) =>
      entry.gift
        ? {
            ...entry,
            gift: {
              ...entry.gift,
              sprite: `${SPRITES}/${entry.gift.sprite}.png`,
            },
          }
        : entry,
    ),
  }),
}));
