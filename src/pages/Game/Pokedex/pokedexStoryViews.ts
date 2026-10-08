import type { ComponentType } from 'react';

import type { Region } from '@/data/maps';
import type { ThemeStyle } from '@/stores/settings';

import { PokemonTypeTags } from './PokemonTypeTags';
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
import type {
  PokedexDrawerProps,
  PokedexListProps,
  PokedexRowProps,
  PokedexSearchProps,
  PokedexTitleProps,
} from './types';
import { ZaDrawer } from './za/ZaDrawer';
import { ZaList } from './za/ZaList';
import { ZaRow } from './za/ZaRow';
import { ZaSearch } from './za/ZaSearch';
import { ZaTitle } from './za/ZaTitle';
import { ZaTypeTags } from './za/ZaTypeTags';

type PokedexStoryView = {
  Drawer: ComponentType<PokedexDrawerProps>;
  List: ComponentType<PokedexListProps>;
  Row: ComponentType<PokedexRowProps>;
  Search: ComponentType<PokedexSearchProps>;
  Title: ComponentType<PokedexTitleProps>;
  TypeTags: ComponentType<{ types: Array<string> }>;
  surfaceClassName?: string;
  rowListClassName: string;
};

const tallGrassView: PokedexStoryView = {
  Drawer: TallGrassDrawer,
  List: TallGrassList,
  Row: TallGrassRow,
  Search: TallGrassSearch,
  Title: TallGrassTitle,
  TypeTags: PokemonTypeTags,
  rowListClassName: 'flex flex-col',
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
      TypeTags: PokemonTypeTags,
      surfaceClassName: 'pokedex-game rounded-none',
      rowListClassName: 'flex flex-col',
    },
  },
  ZA: {
    'tall-grass': tallGrassView,
    game: {
      Drawer: ZaDrawer,
      List: ZaList,
      Row: ZaRow,
      Search: ZaSearch,
      Title: ZaTitle,
      TypeTags: ZaTypeTags,
      surfaceClassName: 'pokedex-za za-screen rounded-2xl border-0',
      rowListClassName: 'mx-auto w-24',
    },
  },
};

export const pokedexStoryViewFor = (region: Region, style: ThemeStyle) =>
  views[region.versionGroup]?.[style] ??
  views[region.versionGroup]?.['tall-grass'] ??
  tallGrassView;
