import { gameDataFor } from '../gameData';

export const missionsFor = (versionGroup: string) =>
  gameDataFor(versionGroup)?.missions;
