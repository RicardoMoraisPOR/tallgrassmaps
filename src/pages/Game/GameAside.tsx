import {
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { LucideIcon } from 'lucide-react';
import { AnimatePresence, m } from 'motion/react';
import { Link, useLocation } from 'react-router';

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from '@/components/ui/drawer';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { DESKTOP_QUERY, TABLET_QUERY } from '@/lib/breakpoints';
import { matchesQuery } from '@/lib/media';
import { easeOutSoft } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/stores/settings';

import { AsideContext, type CardInfo, CardContext } from './asideContext';
import { MapLayersButton } from './Location/MapLayersButton';
import { PokedexButton } from './Pokedex/PokedexButton';
import { PlaceSearchButton } from './Search/PlaceSearch';
import { toolbarButtonClass } from './toolbarButton';

const OFFSCREEN = { x: '115%', opacity: 0 };
const ENTER = { duration: 0.3, ease: easeOutSoft };
const EXIT = { duration: 0.2, ease: easeOutSoft };

type GameAsideProps = {
  contentClassName?: string;
  mapLayers?: boolean;
  children: ReactNode;
};

export const GameAside = ({
  contentClassName,
  mapLayers,
  children,
}: GameAsideProps) => {
  const animations = useSettingsStore((state) => state.animations);
  const [cards, setCards] = useState<Array<CardInfo>>([]);
  const [overrides, setOverrides] = useState<Partial<Record<string, boolean>>>(
    {},
  );
  const tablet = useMediaQuery(TABLET_QUERY);
  const [desktop] = useState(() => matchesQuery(DESKTOP_QUERY));
  const { pathname } = useLocation();
  const [wasPathname, setWasPathname] = useState(pathname);
  const [wasTablet, setWasTablet] = useState(tablet);

  if (pathname !== wasPathname) {
    setWasPathname(pathname);

    if (!tablet) setOverrides({});
  }

  if (tablet !== wasTablet) {
    setWasTablet(tablet);

    if (!tablet) setOverrides({});
  }

  const isOpen = useCallback(
    (id: string, fallback = desktop && tablet) => overrides[id] ?? fallback,
    [overrides, desktop, tablet],
  );
  const close = useCallback(
    (id: string) => setOverrides((current) => ({ ...current, [id]: false })),
    [],
  );
  const register = useCallback((card: CardInfo) => {
    setCards((current) =>
      current.some(({ id }) => id === card.id) ? current : [...current, card],
    );

    return () =>
      setCards((current) => current.filter(({ id }) => id !== card.id));
  }, []);
  const state = useMemo(
    () => ({ modal: !tablet, isOpen, close, register }),
    [tablet, isOpen, close, register],
  );

  const renderCard = ({
    id,
    label,
    icon: Icon,
    to,
    defaultOpen,
    drawer,
    onMobileOpen,
  }: CardInfo) => {
    const open = isOpen(id, defaultOpen);
    const buttonClassName = toolbarButtonClass;
    const content = (
      <>
        <Icon aria-hidden className="size-5 flex-none md:size-4" />
        <span className="hidden text-xs font-medium md:inline">{label}</span>
      </>
    );

    if (to)
      return (
        <Link
          key={id}
          to={to}
          aria-label={label}
          title={label}
          className={cn(buttonClassName, 'text-foreground')}
        >
          {content}
        </Link>
      );

    return (
      <button
        key={id}
        type="button"
        aria-pressed={open}
        aria-label={`${open ? 'Hide' : 'Show'} ${label}`}
        title={`${open ? 'Hide' : 'Show'} ${label}`}
        onClick={() =>
          !tablet && onMobileOpen
            ? onMobileOpen()
            : setOverrides((current) =>
                tablet || open
                  ? { ...current, [id]: !open }
                  : {
                      ...Object.fromEntries(
                        cards.map((card) => [card.id, false]),
                      ),
                      [id]: true,
                    },
              )
        }
        className={cn(
          buttonClassName,
          open || drawer ? 'text-foreground' : 'text-muted-foreground/60',
        )}
      >
        {content}
      </button>
    );
  };

  return (
    <AsideContext value={state}>
      <div className="pointer-events-none absolute top-1/2 left-0 z-30 flex -translate-y-1/2 flex-col gap-2 md:contents">
        <div className="flex flex-col gap-2 md:absolute md:top-4 md:right-4 md:z-30 md:flex-row">
          <PlaceSearchButton />
          {cards.filter(({ drawer }) => !drawer).map(renderCard)}
        </div>
        <div className="flex flex-col gap-2 md:absolute md:right-4 md:bottom-4 md:z-30 md:flex-row">
          {mapLayers && <MapLayersButton />}
          <PokedexButton />
          {cards.filter(({ drawer }) => drawer).map(renderCard)}
        </div>
      </div>
      <m.aside
        layout={animations ? 'position' : false}
        aria-label="Cards"
        className="pointer-events-none absolute top-40 right-4 bottom-4 z-20 flex w-[360px] max-w-[calc(100%-4.5rem)] flex-col md:top-16 md:bottom-16 md:max-w-[calc(100%-2rem)]"
      >
        <div
          className={cn(
            'pointer-events-none flex max-h-full min-h-0 flex-col gap-3 overflow-x-hidden overflow-y-auto overscroll-contain',
            contentClassName,
          )}
        >
          {children}
        </div>
      </m.aside>
    </AsideContext>
  );
};

type AsideCardProps = {
  icon: LucideIcon;
  label: string;
  grow?: boolean;
  to?: string;
  drawer?: boolean;
  onMobileOpen?: () => void;
  className?: string;
  children: ReactNode;
};

export const AsideCard = ({
  icon,
  label,
  grow = false,
  to,
  drawer = false,
  onMobileOpen,
  className,
  children,
}: AsideCardProps) => {
  const { modal, isOpen, close, register } = useContext(AsideContext);
  const animations = useSettingsStore((state) => state.animations);
  const open = isOpen(label, drawer ? false : undefined);

  useEffect(
    () =>
      register({
        id: label,
        label,
        icon,
        to,
        defaultOpen: drawer ? false : undefined,
        drawer,
        onMobileOpen,
      }),
    [register, label, icon, to, drawer, onMobileOpen],
  );

  if (to || (modal && onMobileOpen)) return null;

  if (drawer || modal)
    return (
      <Drawer
        direction={modal ? 'bottom' : 'right'}
        open={open}
        onOpenChange={(next) => !next && close(label)}
      >
        <DrawerContent className="data-[vaul-drawer-direction=bottom]:h-[85svh] data-[vaul-drawer-direction=bottom]:max-h-[85svh] data-[vaul-drawer-direction=right]:w-[26rem] data-[vaul-drawer-direction=right]:max-w-[calc(100%-1rem)] data-[vaul-drawer-direction=right]:sm:max-w-none">
          <DrawerTitle className="sr-only">{label}</DrawerTitle>
          <DrawerDescription className="sr-only">{label}</DrawerDescription>
          <CardContext value={label}>
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain [&>*]:rounded-none [&>*]:border-0">
              {children}
            </div>
          </CardContext>
        </DrawerContent>
      </Drawer>
    );

  return (
    <m.div
      layout={animations ? 'position' : false}
      className={cn(
        'flex flex-col empty:hidden',
        grow && open && 'min-h-48 flex-1',
        className,
      )}
    >
      <AnimatePresence initial={false}>
        {open && (
          <m.div
            key="card"
            initial={OFFSCREEN}
            animate={{ x: 0, opacity: 1, transition: ENTER }}
            exit={{ ...OFFSCREEN, transition: EXIT }}
            className={cn(
              'pointer-events-auto flex min-w-0 flex-col',
              grow && 'min-h-0 flex-1',
            )}
          >
            {children}
          </m.div>
        )}
      </AnimatePresence>
    </m.div>
  );
};
