import { type ComponentType, lazy } from 'react';

import type { Game } from '@/data/games';
import type { Region } from '@/data/maps';

export type PokedexContentProps = {
  game: Game;
  region: Region;
  href: (path: string) => string;
  focus?: number;
};

export type PokedexView = {
  presentation: 'drawer' | 'modal';
  gameTheme?: boolean;
  Content: ComponentType<PokedexContentProps>;
};

export const pokedexViews: Partial<Record<string, PokedexView>> = {
  RBY: {
    presentation: 'drawer',
    gameTheme: true,
    Content: lazy(() =>
      import('./rby/RbyPokedex').then((module) => ({
        default: module.RbyPokedex,
      })),
    ),
  },
  ZA: {
    presentation: 'drawer',
    Content: lazy(() =>
      import('./za/ZaPokedex').then((module) => ({
        default: module.ZaPokedex,
      })),
    ),
  },
};

export const hasPokedex = (region: Region) =>
  region.versionGroup in pokedexViews;
