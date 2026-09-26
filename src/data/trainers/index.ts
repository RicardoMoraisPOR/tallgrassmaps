import { rbyTrainers } from './rby';
import type { TrainerBattle } from './types';

const trainers: Partial<Record<string, Array<TrainerBattle>>> = {
  RBY: rbyTrainers,
};

export const trainersFor = (versionGroup: string) => trainers[versionGroup];
