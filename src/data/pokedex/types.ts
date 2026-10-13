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
  | 'battle'
  | 'hyperspace';

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
  dlc?: boolean;
  encounters: Array<Encounter>;
};

export type RegionalForm = {
  name: string;
  region: 'Alola' | 'Galar' | 'Hisui' | 'Paldea';
  spriteId?: number;
};

export type Transformation = {
  name: string;
  kind: 'mega';
  form?: 'X' | 'Y' | 'Z';
  spriteId?: number;
};

export type Species = {
  number: number;
  name: string;
  types: Array<string>;
  regionalForms?: Array<RegionalForm>;
  transformations?: Array<Transformation>;
};

export type PokedexData = Omit<PokedexEntry, 'name' | 'types'> &
  Partial<Pick<Species, 'name' | 'types'>>;
