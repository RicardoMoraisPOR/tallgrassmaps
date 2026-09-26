export type EncounterMethod =
  | 'walk'
  | 'surf'
  | 'old-rod'
  | 'good-rod'
  | 'super-rod'
  | 'gift'
  | 'fossil'
  | 'static'
  | 'trade'
  | 'prize';

export type Encounter = {
  method: EncounterMethod;
  path: string | null;
  games: Array<string>;
  levels?: [number, number];
  chance?: [number, number];
  tradeFor?: number;
};

export type Evolution = {
  number: number;
  method: 'level' | 'item' | 'trade';
  level?: number;
  item?: string;
};

export type PokedexEntry = {
  number: number;
  name: string;
  types: Array<string>;
  games: Array<string>;
  evolvesFrom?: Evolution;
  encounters: Array<Encounter>;
};
