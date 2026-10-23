import { gameDataFor } from '../gameData';

export const itemsFor = (versionGroup: string) =>
  gameDataFor(versionGroup)?.items;
