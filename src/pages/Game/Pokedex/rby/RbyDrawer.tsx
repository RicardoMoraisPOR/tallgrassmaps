import '@fontsource/press-start-2p';
import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
} from '@/components/ui/drawer';
import { useMediaQuery } from '@/hooks/useMediaQuery';

import type { PokedexDrawerProps } from '../types';

const WIDE_QUERY = '(min-width: 1024px)';

export const RbyDrawer = ({
  open,
  onClose,
  header,
  children,
}: PokedexDrawerProps) => {
  const wide = useMediaQuery(WIDE_QUERY);

  return (
    <Drawer
      open={open}
      onOpenChange={(next) => !next && onClose()}
      direction={wide ? 'right' : 'bottom'}
    >
      <DrawerContent className="pokedex-game data-[vaul-drawer-direction=bottom]:h-[85svh] data-[vaul-drawer-direction=bottom]:max-h-[85svh] data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-md">
        <DrawerHeader className="relative">
          {header}
          <DrawerClose asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Close Pokédex"
              className="absolute top-3 right-3"
            >
              <X aria-hidden />
            </Button>
          </DrawerClose>
        </DrawerHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
