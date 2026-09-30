import { DrawerDescription, DrawerTitle } from '@/components/ui/drawer';

import type { PokedexTitleProps } from '../types';

export const RbyTitle = ({ game, region }: PokedexTitleProps) => (
  <>
    <DrawerTitle>
      {region.name} Pok<span className="normal-case">é</span>dex
    </DrawerTitle>
    <DrawerDescription>{game.fullName}</DrawerDescription>
  </>
);
