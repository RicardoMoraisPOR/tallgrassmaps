import { gameDataFor } from '../gameData';

export const shopsFor = (versionGroup: string) =>
  gameDataFor(versionGroup)?.shops;
