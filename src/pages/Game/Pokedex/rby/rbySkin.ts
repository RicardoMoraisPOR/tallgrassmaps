import '@fontsource/press-start-2p';
import type { ListSkin } from '../ListPokedex';
import { RbyRow } from './RbyRow';
import { RbyTitle } from './RbyTitle';

export const rbySkin: ListSkin = {
  Title: RbyTitle,
  Row: RbyRow,
  drawerClassName: 'pokedex-game',
  searchClassName:
    'flex h-10 items-center gap-2 border-2 border-input bg-background px-3',
  searchIconClassName: 'text-foreground',
  filtersClassName: 'gap-x-3',
  listClassName: 'flex flex-col',
};
