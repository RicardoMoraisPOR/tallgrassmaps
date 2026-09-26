import { type ComponentType, lazy } from 'react';

import type { Game } from '@/data/games';
import type { Region } from '@/data/maps';

export type PokedexContentProps = {
  game: Game;
  region: Region;
  href: (path: string) => string;
};

export type PokedexView = {
  presentation: 'drawer' | 'modal';
  Content: ComponentType<PokedexContentProps>;
};

export const pokedexViews: Partial<Record<string, PokedexView>> = {
  RBY: {
    presentation: 'drawer',
    Content: lazy(() =>
      import('./rby/RbyPokedex').then((module) => ({
        default: module.RbyPokedex,
      })),
    ),
  },
};

export const hasPokedex = (region: Region) =>
  region.versionGroup in pokedexViews;
