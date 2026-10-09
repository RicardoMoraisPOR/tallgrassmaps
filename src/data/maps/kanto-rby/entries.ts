import type {
  Direction,
  LocationKind,
  MapVariant,
  MarkerKind,
  Rect,
} from '../types';
import { type Size, warp } from './helpers';

export type OutdoorEntry = {
  id: string;
  name: string;
  kind: 'town' | 'route';
  size: Size;
  cell: [x: number, y: number];
  variants?: Array<MapVariant>;
};

export type Tile = [x: number, y: number];

export type Teleporter = { area: Rect; pad: Tile; lands: Tile };

export const teleporter = (x: number, y: number, lands: Tile): Teleporter => ({
  area: warp(x, y),
  pad: [x, y],
  lands,
});

export const padFields = ({ pad, lands }: Teleporter) => ({
  pad: pad.join(),
  lands: lands.join(),
});

export type FloorExit = {
  area: Rect;
  pad?: Tile;
  lands?: Tile;
  back?: boolean;
  travel?: Direction;
  ladder?: boolean;
  hole?: boolean;
  current?: boolean;
  door?: boolean;
} & ({ to: string } | { floor: string });

export type FloorEntry = {
  name: string;
  size?: Size;
  exits?: Array<FloorExit>;
  variants?: Array<MapVariant>;
  games?: Array<string>;
};

export type InsideEntry = {
  id: string;
  name: string;
  kind: LocationKind;
  size: Size;
  parent: string;
  otherParents?: Array<string>;
  entrances: Array<Rect | { area: Rect; floor: string }>;
  otherEntrances?: Record<string, Array<Rect>>;
  exits?: Array<Rect | { area: Rect; to: string } | Teleporter>;
  cell?: [x: number, y: number];
  floors?: Array<FloorEntry>;
  variants?: Array<MapVariant>;
  marker?: MarkerKind;
  games?: Array<string>;
};
