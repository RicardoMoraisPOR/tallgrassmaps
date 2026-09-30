import data from './rby.json';
import type { MapItem } from './types';

const ITEM_SPRITE = '/sprites/rby/overworld/poke_ball.png';

export const rbyItems = (data as Array<MapItem>).map((item) => ({
  ...item,
  sprite: ITEM_SPRITE,
}));
