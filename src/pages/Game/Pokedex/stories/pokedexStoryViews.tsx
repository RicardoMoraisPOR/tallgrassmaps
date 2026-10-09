import type { ComponentType } from 'react';

import type { Region } from '@/data/maps';
import type { ThemeStyle } from '@/stores/settings';

import {
  ListDrawer,
  type ListSkin,
  ListPokedexList,
  ListSearch,
} from '../ListPokedex';
import { PokemonTypeTags } from '../PokemonTypeTags';
import { rbySkin } from '../rby/rbySkin';
import { tallGrassSkin } from '../tall-grass/tallGrassSkin';
import type {
  PokedexDrawerProps,
  PokedexListProps,
  PokedexRowProps,
  PokedexSearchProps,
  PokedexTitleProps,
} from '../types';
import { ZaDrawer } from '../za/ZaDrawer';
import { ZaList } from '../za/ZaList';
import { ZaRow } from '../za/ZaRow';
import { ZaSearch } from '../za/ZaSearch';
import { ZaTitle } from '../za/ZaTitle';
import { ZaTypeTags } from '../za/ZaTypeTags';

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

const listView = (
  skin: ListSkin,
  surfaceClassName?: string,
): PokedexStoryView => ({
  Drawer: (props) => <ListDrawer skin={skin} {...props} />,
  List: (props) => <ListPokedexList skin={skin} {...props} />,
  Row: skin.Row,
  Search: (props) => <ListSearch skin={skin} {...props} />,
  Title: skin.Title,
  TypeTags: PokemonTypeTags,
  surfaceClassName,
  rowListClassName: 'flex flex-col',
});

const tallGrassView = listView(tallGrassSkin);

const views: Partial<
  Record<string, Partial<Record<ThemeStyle, PokedexStoryView>>>
> = {
  RBY: {
    'tall-grass': tallGrassView,
    game: listView(rbySkin, 'pokedex-game rounded-none'),
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
