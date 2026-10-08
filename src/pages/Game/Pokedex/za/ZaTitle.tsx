import { DrawerDescription, DrawerTitle } from '@/components/ui/drawer';

import type { PokedexTitleProps } from '../types';

export const ZaTitle = ({ game }: PokedexTitleProps) => (
  <div className="flex items-center gap-3">
    <span aria-hidden className="h-8 w-1 bg-(--za-green)" />
    <DrawerTitle className="za-heading text-2xl text-white uppercase sm:text-3xl">
      Pokédex
    </DrawerTitle>
    <DrawerDescription className="sr-only">{game.fullName}</DrawerDescription>
  </div>
);
