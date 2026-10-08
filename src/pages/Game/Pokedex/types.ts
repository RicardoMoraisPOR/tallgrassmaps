import type { ReactNode } from 'react';

import type { Game } from '@/data/games';
import type { Region } from '@/data/maps';
import type { PokedexEntry } from '@/data/pokedex/types';

import type { PokedexSearchState } from './usePokedexSearch';

export type PokedexContext = {
  game: Game;
  region: Region;
  href: (path: string) => string;
  nameOf: (number: number) => string;
};

export type PokedexProps = PokedexContext & {
  entries: Array<PokedexEntry>;
  open: boolean;
  focus?: number;
  onClose: () => void;
  search: PokedexSearchState;
};

export type PokedexRowProps = PokedexContext & {
  entry: PokedexEntry;
  focused?: boolean;
  selected?: boolean;
  onSelect?: () => void;
};

export type PokedexListProps = PokedexContext & {
  entries: Array<PokedexEntry>;
  focus?: number;
  selectedNumber?: number;
  onSelectNumber?: (number: number) => void;
};

export type PokedexDrawerProps = {
  open: boolean;
  onClose: () => void;
  header: ReactNode;
  children: ReactNode;
};

export type PokedexTitleProps = {
  game: Game;
  region: Region;
};

export type PokedexSearchProps = {
  search: PokedexSearchState;
};
