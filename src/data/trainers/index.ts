import { rbyTrainers } from './rby';
import type { TrainerBattle } from './types';
import { zaTrainers } from './za';

const trainers: Partial<Record<string, Array<TrainerBattle>>> = {
  RBY: rbyTrainers,
  ZA: zaTrainers,
};

export const trainersFor = (versionGroup: string) => trainers[versionGroup];
