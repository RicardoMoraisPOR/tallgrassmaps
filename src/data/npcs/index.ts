import { rbyNpcs } from './rby';
import type { MapNpc } from './types';

const npcs: Partial<Record<string, Array<MapNpc>>> = {
  RBY: rbyNpcs,
};

export const npcsFor = (versionGroup: string) => npcs[versionGroup];
