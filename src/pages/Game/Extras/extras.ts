import { missionsFor } from '@/data/missions';

import type { GameExtra } from './types';
import { MissionsExtra } from './za/MissionsExtra';

const extras: Partial<Record<string, Array<GameExtra>>> = {
  ZA: [
    {
      id: 'missions',
      title: 'Missions',
      count: missionsFor('ZA')?.length ?? 0,
      Content: MissionsExtra,
    },
  ],
};

export const extrasFor = (versionGroup: string) => extras[versionGroup];
