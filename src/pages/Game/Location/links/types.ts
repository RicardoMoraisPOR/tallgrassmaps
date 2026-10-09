import type { ReactNode } from 'react';

import type { MapLink } from '@/components/map/viewer/types';
import type { MapItem } from '@/data/items/types';
import type { Direction, WildArea } from '@/data/maps';
import type { MapNpc } from '@/data/npcs/types';
import type { MapSign } from '@/data/signs/types';
import type { StaticPokemon } from '@/data/static-pokemon/types';

import type { MapLayer, MapLayerId } from '../mapLayers';
import type { ListedBattle } from '../trainerList';
import type { FloorStep } from './floors';

export type LayerEntry = {
  key: string;
  target?: string;
  name: string;
  href?: string;
  travel?: Direction;
  replace?: boolean;
  opens?: boolean;
};

export type LayerGroup = {
  layer: MapLayer;
  entries: Array<LayerEntry>;
};

export type LayerSection = {
  id: 'interactions' | 'exits';
  groups: Array<LayerGroup>;
};

export type LayeredMapLink = MapLink & {
  layer: MapLayerId;
  stairs?: boolean;
  ladder?: boolean;
  hole?: boolean;
  current?: boolean;
  door?: boolean;
  teleport?: boolean;
  step?: FloorStep;
  unlisted?: boolean;
};

export type MarkerSources = {
  from?: string;
  items?: Array<MapItem>;
  itemTooltip?: (item: MapItem) => ReactNode;
  trainers?: Array<ListedBattle>;
  onSelectTrainer?: (key: string) => void;
  trainerTooltip?: (group: Array<ListedBattle>) => ReactNode;
  npcs?: Array<MapNpc>;
  npcTooltip?: (npc: MapNpc) => ReactNode;
  signs?: Array<MapSign>;
  signTooltip?: (sign: MapSign) => ReactNode;
  onOpen?: (target: NonNullable<MapSign['opens']>) => void;
  wildAreas?: Array<WildArea>;
  wildPopup?: (method: WildArea['method'], note?: string) => ReactNode;
  staticPokemon?: Array<StaticPokemon>;
  staticPopup?: (pokemon: StaticPokemon) => ReactNode;
};
