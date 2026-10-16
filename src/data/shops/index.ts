import { rbyShops } from './rby';
import type { Shop } from './types';

const shops: Partial<Record<string, Array<Shop>>> = {
  RBY: rbyShops,
};

export const shopsFor = (versionGroup: string) => shops[versionGroup];
