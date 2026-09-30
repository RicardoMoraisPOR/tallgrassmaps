import data from './rby.json';
import type { MapSign } from './types';

const SPRITES = '/sprites/rby/overworld';

export const rbySigns = (data as Array<MapSign>).map((sign) =>
  sign.sprite ? { ...sign, sprite: `${SPRITES}/${sign.sprite}.png` } : sign,
);
