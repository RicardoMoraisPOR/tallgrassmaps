import {
  type MouseEvent,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from 'react';

import { ArrowLeft } from 'lucide-react';
import { m } from 'motion/react';

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

import { COLORS } from './config';
import { Pokeballs, type Throw } from './Pokeball';
import { type Bounds, type Rect, type Registry, Swarm } from './Swarm';

const EXPAND_SECONDS = 1;
const EASE = [0.22, 1, 0.36, 1] as const;
const HIT_PADDING_PIXELS = 14;
const SWARM_AFTER_MS = 900;
const GRID_CELL_PIXELS = 56;
const GRID_LINE = 'rgb(108 196 106 / 0.14)';

export type TileRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type HeroEggProps = {
  from: TileRect;
  initialBounds: Bounds;
  sectionRef: RefObject<HTMLElement | null>;
  onClose: () => void;
};

const measureObstacles = (section: HTMLElement | null): Array<Rect> => {
  if (!section) return [];

  const box = section.getBoundingClientRect();

  return Array.from(
    section.querySelectorAll<HTMLElement>('[data-hero-obstacle]'),
  ).map((element) => {
    const range = document.createRange();

    range.selectNodeContents(element);

    const rect =
      element.dataset.heroObstacle === 'text'
        ? range.getBoundingClientRect()
        : element.getBoundingClientRect();

    return {
      left: rect.left - box.left,
      top: rect.top - box.top,
      right: rect.right - box.left,
      bottom: rect.bottom - box.top,
    };
  });
};

const measure = (element: HTMLElement | null): Bounds => ({
  width: element?.clientWidth ?? 0,
  height: element?.clientHeight ?? 0,
});

export const HeroEgg = ({
  from,
  initialBounds,
  sectionRef,
  onClose,
}: HeroEggProps) => {
  const reducedMotion = usePrefersReducedMotion();
  const [bounds, setBounds] = useState(initialBounds);
  const [settled, setSettled] = useState(false);
  const [throws, setThrows] = useState<Array<Throw>>([]);
  const root = useRef<HTMLDivElement>(null);
  const throwCount = useRef(0);
  const registry = useRef<Registry>(new Map());
  const [obstacles] = useState(() => ({
    current: measureObstacles(sectionRef.current),
  }));

  useEffect(() => {
    const element = sectionRef.current;

    if (!element) return;

    const observer = new ResizeObserver(() => {
      obstacles.current = measureObstacles(element);
      setBounds(measure(element));
    });

    const settle = setTimeout(
      () => {
        obstacles.current = measureObstacles(element);
        setSettled(true);
      },
      reducedMotion ? 0 : SWARM_AFTER_MS,
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      clearTimeout(settle);
    };
  }, [sectionRef, obstacles, reducedMotion]);

  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    const closeFromLogo = (event: Event) => {
      if (!(event.target as Element).closest('header a[href="/"]')) return;

      event.preventDefault();
      event.stopPropagation();
      onClose();
    };

    window.addEventListener('keydown', close);
    document.addEventListener('click', closeFromLogo, true);

    return () => {
      window.removeEventListener('keydown', close);
      document.removeEventListener('click', closeFromLogo, true);
    };
  }, [onClose]);

  const throwBall = (event: MouseEvent) => {
    const rect = root.current?.getBoundingClientRect();

    if (reducedMotion || !rect) return;
    if ((event.target as HTMLElement).closest('a, button')) return;

    throwCount.current += 1;

    const next: Throw = {
      key: throwCount.current,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    const target = nearestCritter(next);

    if (target) next.id = target.id;

    setThrows((current) => [...current, next]);
  };

  const nearestCritter = ({ x, y }: { x: number; y: number }) =>
    Array.from(registry.current.values())
      .filter((critter) => !critter.busy())
      .map((critter) => ({
        critter,
        distance: Math.hypot(critter.x.get() - x, critter.y.get() - y),
      }))
      .filter(
        ({ critter, distance }) =>
          distance <= critter.size * 0.6 + HIT_PADDING_PIXELS,
      )
      .sort((a, b) => a.distance - b.distance)[0]?.critter;

  const catchAt = ({ id }: Throw) => {
    const hit = id === undefined ? undefined : registry.current.get(id);

    if (!hit || hit.busy()) return null;

    hit.capture();

    return hit;
  };

  const follow = (id: number) => {
    const critter = registry.current.get(id);

    return critter?.busy() ? undefined : critter;
  };

  const duration = reducedMotion ? 0 : EXPAND_SECONDS;

  return (
    <m.div
      ref={root}
      onClick={throwBall}
      className="absolute z-0 cursor-crosshair overflow-hidden select-none"
      style={{
        border: `2px solid ${COLORS.light}`,
        backgroundColor: 'rgb(108 196 106 / 0.13)',
      }}
      initial={{
        left: from.left,
        top: from.top,
        width: from.width,
        height: from.height,
        borderRadius: 6,
      }}
      animate={{
        left: 0,
        top: 0,
        width: bounds.width,
        height: bounds.height,
        borderRadius: 0,
      }}
      exit={{ opacity: 0 }}
      transition={{ duration, ease: EASE }}
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(${GRID_LINE} 1px, transparent 1px), linear-gradient(90deg, ${GRID_LINE} 1px, transparent 1px)`,
          backgroundSize: `${GRID_CELL_PIXELS}px ${GRID_CELL_PIXELS}px`,
        }}
      />
      <Pokeballs
        throws={throws}
        bounds={bounds}
        onLand={catchAt}
        follow={follow}
        onDone={(key) =>
          setThrows((current) => current.filter((item) => item.key !== key))
        }
      />
      {settled && (
        <Swarm
          bounds={bounds}
          obstaclesRef={obstacles}
          registry={registry}
          still={reducedMotion}
        />
      )}
      <m.button
        type="button"
        aria-label="Back to the grass"
        onClick={onClose}
        className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-foreground outline-none select-none hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50"
        initial={reducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: duration }}
      >
        <ArrowLeft aria-hidden className="size-3.5" />
        Back to the grass
      </m.button>
    </m.div>
  );
};
