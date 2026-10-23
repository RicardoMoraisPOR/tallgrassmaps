import { gameDataFor } from '../gameData';

export const npcsFor = (versionGroup: string) =>
  gameDataFor(versionGroup)?.npcs;
