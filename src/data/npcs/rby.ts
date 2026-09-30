import data from './rby.json';
import type { MapNpc } from './types';

const SPRITES = '/sprites/rby/overworld';

export const rbyNpcs = (data as Array<MapNpc>).map((npc) => ({
  ...npc,
  sprite: `${SPRITES}/${npc.sprite}.png`,
  dialog: npc.dialog.map((entry) =>
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
}));
