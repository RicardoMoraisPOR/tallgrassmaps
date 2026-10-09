import '@fontsource/barlow/500.css';
import '@fontsource/barlow/700.css';
import '@fontsource/michroma';
import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
} from '@/components/ui/drawer';

import type { PokedexDrawerProps } from '../types';

export const ZaDrawer = ({
  open,
  onClose,
  header,
  children,
}: PokedexDrawerProps) => (
  <Drawer
    open={open}
    onOpenChange={(next) => !next && onClose()}
    direction="bottom"
    handleOnly
  >
    <DrawerContent className="pokedex-za za-screen select-text! data-[vaul-drawer-direction=bottom]:mt-0 data-[vaul-drawer-direction=bottom]:h-svh data-[vaul-drawer-direction=bottom]:max-h-svh data-[vaul-drawer-direction=bottom]:rounded-none data-[vaul-drawer-direction=bottom]:border-0">
      <div
        aria-hidden
        className="za-scanlines pointer-events-none absolute inset-0"
      />
      <DrawerHeader className="relative flex-row items-center justify-between px-5 py-4 sm:px-8">
        {header}
        <DrawerClose asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close Pokédex"
            className="hover:bg-white/15"
          >
            <X aria-hidden />
          </Button>
        </DrawerClose>
      </DrawerHeader>
      <div className="relative flex min-h-0 flex-1 flex-col">{children}</div>
    </DrawerContent>
  </Drawer>
);
