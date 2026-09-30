import { DrawerDescription, DrawerTitle } from '@/components/ui/drawer';

import type { PokedexTitleProps } from '../types';

export const TallGrassTitle = ({ game, region }: PokedexTitleProps) => (
  <>
    <DrawerTitle>{region.name} Pokédex</DrawerTitle>
    <DrawerDescription>{game.fullName}</DrawerDescription>
  </>
);
