import data from './rby.json';
import type { MapNpc } from './types';

const SPRITES = '/sprites/rby/overworld';

export const rbyNpcs = (data as Array<MapNpc>).map((npc) => ({
  ...npc,
  sprite: `${SPRITES}/${npc.sprite}.png`,
}));
