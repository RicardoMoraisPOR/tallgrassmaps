import type { ComponentType } from 'react';

import type { Region } from '@/data/maps';
import type { ThemeStyle } from '@/stores/settings';

import type {
  PokedexDrawerProps,
  PokedexListProps,
  PokedexRowProps,
  PokedexSearchProps,
  PokedexTitleProps,
} from './types';
import { RbyDrawer } from './rby/RbyDrawer';
import { RbyList } from './rby/RbyList';
import { RbyRow } from './rby/RbyRow';
import { RbySearch } from './rby/RbySearch';
import { RbyTitle } from './rby/RbyTitle';
import { TallGrassDrawer } from './tall-grass/TallGrassDrawer';
import { TallGrassList } from './tall-grass/TallGrassList';
import { TallGrassRow } from './tall-grass/TallGrassRow';
import { TallGrassSearch } from './tall-grass/TallGrassSearch';
import { TallGrassTitle } from './tall-grass/TallGrassTitle';

type PokedexStoryView = {
  Drawer: ComponentType<PokedexDrawerProps>;
  List: ComponentType<PokedexListProps>;
  Row: ComponentType<PokedexRowProps>;
  Search: ComponentType<PokedexSearchProps>;
  Title: ComponentType<PokedexTitleProps>;
  gameTheme: boolean;
};

const tallGrassView: PokedexStoryView = {
  Drawer: TallGrassDrawer,
  List: TallGrassList,
  Row: TallGrassRow,
  Search: TallGrassSearch,
  Title: TallGrassTitle,
  gameTheme: false,
};

const views: Partial<
  Record<string, Partial<Record<ThemeStyle, PokedexStoryView>>>
> = {
  RBY: {
    'tall-grass': tallGrassView,
    game: {
      Drawer: RbyDrawer,
      List: RbyList,
      Row: RbyRow,
      Search: RbySearch,
      Title: RbyTitle,
      gameTheme: true,
    },
  },
  ZA: { 'tall-grass': tallGrassView },
};

export const pokedexStoryViewFor = (region: Region, style: ThemeStyle) =>
  views[region.versionGroup]?.[style] ??
  views[region.versionGroup]?.['tall-grass'] ??
  tallGrassView;
