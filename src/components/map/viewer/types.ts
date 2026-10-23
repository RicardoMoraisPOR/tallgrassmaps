import { type ReactNode } from 'react';

import type { Direction, Rect } from '@/data/maps';
import type { GbcPaletteId } from '@/data/maps/gbcPalettes';
import type { SpriteFacing } from '@/data/trainers/types';

export type MapLink = Rect & {
  floorId?: string;
  href?: string;
  label: string;
  travel?: Direction;
  className?: string;
  replace?: boolean;
  highlightKey?: string | Array<string>;
  onClick?: () => void;
  tooltip?: ReactNode;
  tooltipOnClick?: boolean;
  tooltipAtClick?: boolean;
  behind?: boolean;
  badge?: number;
  area?: MapLink;
  outline?: Array<Array<[number, number]>>;
  sprite?: {
    src: string;
    facing: SpriteFacing;
    faded?: boolean;
    size?: [width: number, height: number];
  };
  icon?: MapIconKind;
  zoom?: number;
};

export type MapIconKind =
  | { kind: 'arrow'; direction: Direction }
  | { kind: 'door' }
  | { kind: 'exit' }
  | { kind: 'stairs' | 'ladder' | 'hole' | 'current'; step?: 'up' | 'down' }
  | { kind: 'teleport' }
  | { kind: 'sign' }
  | { kind: 'register' }
  | { kind: 'cave' }
  | { kind: 'gym' }
  | { kind: 'start' }
  | { kind: 'league' }
  | { kind: 'legendary' }
  | { kind: 'mart' }
  | { kind: 'center' };

export type FloorFrame = {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type FitBounds = {
  key: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type TileCluster = {
  tileId: string;
  x: number;
  y: number;
  kinds: Array<MapIconKind['kind']>;
  label: string;
};

export type MapPalette = {
  on: boolean;
  onToggle: () => void;
  of: (floorId?: string) => GbcPaletteId | undefined;
  objectsOf: (floorId?: string) => GbcPaletteId | undefined;
};
