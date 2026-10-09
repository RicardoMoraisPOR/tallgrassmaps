import type { ListSkin } from '../ListPokedex';
import { TallGrassRow } from './TallGrassRow';
import { TallGrassTitle } from './TallGrassTitle';

export const tallGrassSkin: ListSkin = {
  Title: TallGrassTitle,
  Row: TallGrassRow,
  searchClassName:
    'flex h-10 items-center gap-2 rounded-[10px] border border-input bg-background px-3 dark:bg-input/30',
  searchIconClassName: 'text-muted-foreground',
  listClassName: 'flex flex-col gap-1.5',
};
