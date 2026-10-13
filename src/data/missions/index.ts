import type { Mission } from './types';
import { zaMissions } from './za';

const missions: Partial<Record<string, Array<Mission>>> = {
  ZA: zaMissions,
};

export const missionsFor = (versionGroup: string) => missions[versionGroup];
