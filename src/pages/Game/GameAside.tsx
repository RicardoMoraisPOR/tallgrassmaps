import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { LucideIcon } from 'lucide-react';
import { AnimatePresence, m } from 'motion/react';
import { Link } from 'react-router';

import { useMediaQuery } from '@/hooks/useMediaQuery';
import { DESKTOP_QUERY, TABLET_QUERY } from '@/lib/breakpoints';
import { easeOutSoft } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/stores/settings';

type CardInfo = {
  id: string;
  label: string;
  icon: LucideIcon;
  to?: string;
};

type AsideState = {
  immersive: boolean;
  isOpen: (id: string) => boolean;
  register: (card: CardInfo) => () => void;
};

const AsideContext = createContext<AsideState>({
  immersive: false,
  isOpen: () => true,
  register: () => () => {},
});

const OFFSCREEN = { x: '115%', opacity: 0 };
const ENTER = { duration: 0.3, ease: easeOutSoft };
const EXIT = { duration: 0.2, ease: easeOutSoft };

type GameAsideProps = {
  immersive: boolean;
  contentClassName?: string;
  children: ReactNode;
};

export const GameAside = ({
  immersive,
  contentClassName,
  children,
}: GameAsideProps) => {
  const animations = useSettingsStore((state) => state.animations);
  const [cards, setCards] = useState<Array<CardInfo>>([]);
  const [overrides, setOverrides] = useState<Partial<Record<string, boolean>>>(
    {},
  );
  const tablet = useMediaQuery(TABLET_QUERY);
  const [desktop] = useState(() => window.matchMedia(DESKTOP_QUERY).matches);

  const isOpen = useCallback(
    (id: string) => overrides[id] ?? desktop,
    [overrides, desktop],
  );
  const register = useCallback((card: CardInfo) => {
    setCards((current) =>
      current.some(({ id }) => id === card.id) ? current : [...current, card],
    );

    return () =>
      setCards((current) => current.filter(({ id }) => id !== card.id));
  }, []);
  const state = useMemo(
    () => ({ immersive, isOpen, register }),
    [immersive, isOpen, register],
  );

  return (
    <AsideContext value={state}>
      {immersive && (
        <div className="pointer-events-none absolute top-1/2 left-0 z-30 flex -translate-y-1/2 flex-col gap-2 md:top-4 md:right-16 md:left-auto md:translate-y-0 md:flex-row md:gap-2">
          {cards.map(({ id, label, icon: Icon, to }) => {
            const open = isOpen(id);
            const buttonClassName =
              'pointer-events-auto flex h-12 min-w-12 items-center justify-center gap-2 rounded-r-[16px] border border-l-0 bg-card outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 md:h-9 md:min-w-9 md:rounded-[14px] md:border-l md:px-3';
            const content = (
              <>
                <Icon aria-hidden className="size-5 flex-none md:size-4" />
                <span className="hidden text-[13px] font-medium md:inline">
                  {label}
                </span>
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
                  setOverrides((current) =>
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
                  open ? 'text-foreground' : 'text-muted-foreground/60',
                )}
              >
                {content}
              </button>
            );
          })}
        </div>
      )}
      <m.aside
        layout={animations ? 'position' : false}
        aria-label="Cards"
        className={cn(
          immersive
            ? 'pointer-events-none absolute top-40 right-4 bottom-4 z-20 flex w-[360px] max-w-[calc(100%-4.5rem)] flex-col md:top-16 md:max-w-[calc(100%-2rem)]'
            : 'flex min-w-0 flex-col lg:relative lg:self-stretch',
        )}
      >
        <div
          className={cn(
            'flex min-h-0 flex-col gap-3',
            immersive
              ? 'pointer-events-none max-h-full overflow-x-hidden overflow-y-auto overscroll-contain'
              : 'lg:absolute lg:inset-0 lg:overflow-x-hidden lg:overflow-y-auto',
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
  className?: string;
  children: ReactNode;
};

export const AsideCard = ({
  icon,
  label,
  grow = false,
  to,
  className,
  children,
}: AsideCardProps) => {
  const { immersive, isOpen, register } = useContext(AsideContext);
  const animations = useSettingsStore((state) => state.animations);
  const open = isOpen(label);

  useEffect(
    () => register({ id: label, label, icon, to }),
    [register, label, icon, to],
  );

  if (!immersive) {
    return (
      <m.div
        layout={animations ? 'position' : false}
        className={cn(
          'flex min-w-0 flex-col',
          grow && 'lg:min-h-0 lg:flex-1',
          className,
        )}
      >
        {children}
      </m.div>
    );
  }

  if (to) return null;

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
