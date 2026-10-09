import type { Game, Platform } from '../games';

export type UpcomingGame = {
  id: string;
  title: string;
  status: 'coming-soon';
  regions: Array<string>;
  platform: Platform;
  versionGroup: string;
  colors: Array<string>;
};

export type CatalogEntry = Game | UpcomingGame;

export type Generation = {
  number: number;
  roman: string;
  entries: Array<CatalogEntry>;
};

export type MapSetGame = {
  id: string;
  name: string;
  color: string;
  available: boolean;
};

export type MapSet = {
  versionGroup: string;
  regions: Array<string>;
  games: Array<MapSetGame>;
  available: boolean;
};
