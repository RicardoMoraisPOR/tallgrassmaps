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

export const pokedexViews: Partial<Record<string, PokedexView>> = {
  RBY: { 'tall-grass': TallGrassPokedex, game: RbyPokedex },
  ZA: { 'tall-grass': TallGrassPokedex },
};

export const hasPokedex = (region: Region) =>
  region.versionGroup in pokedexViews;
