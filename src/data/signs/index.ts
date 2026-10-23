import { gameDataFor } from '../gameData';

export const signsFor = (versionGroup: string) =>
  gameDataFor(versionGroup)?.signs;
