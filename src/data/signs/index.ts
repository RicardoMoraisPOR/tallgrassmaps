import { rbySigns } from './rby';
import type { MapSign } from './types';

const signs: Partial<Record<string, Array<MapSign>>> = {
  RBY: rbySigns,
};

export const signsFor = (versionGroup: string) => signs[versionGroup];
