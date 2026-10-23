import { gameDataFor } from '../gameData';

export const trainersFor = (versionGroup: string) =>
  gameDataFor(versionGroup)?.trainers;
