export type EncounterMethod =
  | 'walk'
  | 'surf'
  | 'old-rod'
  | 'good-rod'
  | 'super-rod'
  | 'gift'
  | 'fossil'
  | 'fossil-item'
  | 'static'
  | 'trade'
  | 'prize'
  | 'battle';

export type EncounterFloor = {
  floor: string;
  levels?: [number, number];
  chance?: [number, number];
};

export type EncounterAlpha = {
  chance: number;
  levels?: [number, number];
};

export type Encounter = {
  method: EncounterMethod;
  path: string | null;
  place?: string;
  games: Array<string>;
  levels?: [number, number];
  chance?: [number, number];
  tradeFor?: number;
  alpha?: EncounterAlpha;
  note?: string;
  floors?: Array<EncounterFloor>;
};

export type Evolution = {
  number: number;
  method: 'level' | 'item' | 'trade' | 'other';
  level?: number;
  item?: string;
  note?: string;
};

export type MegaEvolution = {
  stone: string;
  form?: 'X' | 'Y' | 'Z';
  new?: boolean;
  dlc?: boolean;
  types?: Array<string>;
};

export type PokedexEntry = {
  id: number;
  number: number;
  name: string;
  types: Array<string>;
  games: Array<string>;
  evolvesFrom?: Evolution;
  megas?: Array<MegaEvolution>;
  encounters: Array<Encounter>;
};

export type Species = {
  number: number;
  name: string;
  types: Array<string>;
};

export type PokedexData = Omit<PokedexEntry, 'name' | 'types'> &
  Partial<Pick<Species, 'name' | 'types'>>;
