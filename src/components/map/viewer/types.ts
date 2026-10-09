import { type ReactNode } from 'react';

import type { Direction, Rect } from '@/data/maps';
import type { SpriteFacing } from '@/data/trainers/types';

export type MapLink = Rect & {
  href?: string;
  label: string;
  travel?: Direction;
  className?: string;
  replace?: boolean;
  highlightKey?: string | Array<string>;
  onClick?: () => void;
  popup?: ReactNode;
  tooltip?: ReactNode;
  tooltipOnClick?: boolean;
  tooltipAtClick?: boolean;
  behind?: boolean;
  outline?: Array<Array<[number, number]>>;
  sprite?: {
    src: string;
    facing: SpriteFacing;
    faded?: boolean;
    size?: [width: number, height: number];
  };
  icon?: MapIconKind;
};

export type MapIconKind =
  | { kind: 'arrow'; direction: Direction }
  | { kind: 'door' }
  | { kind: 'exit' }
  | { kind: 'stairs' | 'ladder' | 'hole' | 'current'; step?: 'up' | 'down' }
  | { kind: 'teleport' }
  | { kind: 'sign' };
