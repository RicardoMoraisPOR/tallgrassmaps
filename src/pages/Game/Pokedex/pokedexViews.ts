import { type ComponentType, lazy } from 'react';

import type { Region } from '@/data/maps';
import type { ThemeStyle } from '@/stores/settings';

import type { PokedexProps } from './types';

export type PokedexView = Partial<
  Record<ThemeStyle, ComponentType<PokedexProps>>
>;

const TallGrassPokedex = lazy(() =>
  import('./tall-grass/TallGrassPokedex').then((module) => ({
    default: module.TallGrassPokedex,
  })),
);

export const defaultPokedexView = TallGrassPokedex;

const RbyPokedex = lazy(() =>
  import('./rby/RbyPokedex').then((module) => ({
    default: module.RbyPokedex,
  })),
);

const ZaPokedex = lazy(() =>
  import('./za/ZaPokedex').then((module) => ({
    default: module.ZaPokedex,
  })),
);

export const pokedexViews: Partial<Record<string, PokedexView>> = {
  RBY: { 'tall-grass': TallGrassPokedex, game: RbyPokedex },
  ZA: { 'tall-grass': TallGrassPokedex, game: ZaPokedex },
};

const preloaders: Partial<Record<string, () => Promise<unknown>>> = {
  RBY: () => import('./rby/RbyPokedex'),
  ZA: () => import('./za/ZaPokedex'),
};

export const preloadPokedex = (region: Region) =>
  preloaders[region.versionGroup]?.();

export const hasPokedex = (region: Region) =>
  region.versionGroup in pokedexViews;
