import { rbyItems } from './rby';
import type { MapItem } from './types';

const items: Partial<Record<string, Array<MapItem>>> = {
  RBY: rbyItems,
};

export const itemsFor = (versionGroup: string) => items[versionGroup];
