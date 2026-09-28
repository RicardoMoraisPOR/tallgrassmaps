import { type ReactNode, Suspense } from 'react';

import '@fontsource/press-start-2p';
import { X } from 'lucide-react';

import { useThemeStyle } from '@/components/settings/themes';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import type { Game } from '@/data/games';
import type { Region } from '@/data/maps';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

import { pokedexViews } from './pokedexViews';
import { usePokedex } from './usePokedex';

const WIDE_QUERY = '(min-width: 1024px)';

type PokedexOverlayProps = {
  game: Game;
  region: Region;
  href: (path: string) => string;
};

export const PokedexOverlay = ({ game, region, href }: PokedexOverlayProps) => {
  const { open, focus, close } = usePokedex();
  const themeStyle = useThemeStyle('pokedex');

  const view = pokedexViews[region.versionGroup];

  if (!view) return null;

  const gameTheme = themeStyle === 'game' && Boolean(view.gameTheme);
  const title = gameTheme ? (
    <>
      {region.name} Pok<span className="normal-case">é</span>dex
    </>
  ) : (
    `${region.name} Pokédex`
  );
  const onOpenChange = (next: boolean) => {
    if (!next) close();
  };
  const content = (
    <Suspense fallback={<Loading />}>
      <view.Content game={game} region={region} href={href} focus={focus} />
    </Suspense>
  );

  return view.presentation === 'modal' ? (
    <PokedexModal
      open={open}
      onOpenChange={onOpenChange}
      gameTheme={gameTheme}
      title={title}
      description={game.name}
    >
      {content}
    </PokedexModal>
  ) : (
    <PokedexDrawer
      open={open}
      onOpenChange={onOpenChange}
      gameTheme={gameTheme}
      title={title}
      description={game.name}
    >
      {content}
    </PokedexDrawer>
  );
};

type ContainerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gameTheme: boolean;
  title: ReactNode;
  description: string;
  children: ReactNode;
};

const PokedexDrawer = ({
  open,
  onOpenChange,
  gameTheme,
  title,
  description,
  children,
}: ContainerProps) => {
  const wide = useMediaQuery(WIDE_QUERY);

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction={wide ? 'right' : 'bottom'}
    >
      <DrawerContent
        className={cn(
          'data-[vaul-drawer-direction=bottom]:h-[85svh] data-[vaul-drawer-direction=bottom]:max-h-[85svh] data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-md',
          gameTheme && 'pokedex-game',
        )}
      >
        <DrawerHeader className="relative">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
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

const PokedexModal = ({
  open,
  onOpenChange,
  gameTheme,
  title,
  description,
  children,
}: ContainerProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'flex max-h-[85svh] flex-col sm:max-w-3xl',
          gameTheme && 'pokedex-game',
        )}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </DialogContent>
    </Dialog>
  );
};

const Loading = () => {
  return (
    <p className="py-10 text-center text-sm text-muted-foreground">
      Loading Pokédex…
    </p>
  );
};
