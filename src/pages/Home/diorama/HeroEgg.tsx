import {
  Fragment,
  type MouseEvent,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from 'react';

import { ArrowLeft, ArrowRight } from 'lucide-react';
import { m } from 'motion/react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

import { COLORS, GLOW } from './config';
import { Pokeballs, type Throw } from './Pokeball';
import { type Bounds, type Registry, Swarm } from './Swarm';

const EXPAND_SECONDS = 1;
const EASE = [0.22, 1, 0.36, 1] as const;
const MESSAGE_DELAY_SECONDS = 1.1;
const TITLE = 'Yes! There is way more to explore.';
const SLIDE_DISTANCE_EM = 0.6;
const SLIDE_SECONDS = 0.9;
const SLIDE_STAGGER_SECONDS = 0.03;
const BACK_DELAY_SECONDS = 2.2;
const HIT_PADDING_PIXELS = 14;
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
  const [throws, setThrows] = useState<Array<Throw>>([]);
  const root = useRef<HTMLDivElement>(null);
  const throwCount = useRef(0);
  const registry = useRef<Registry>(new Map());

  useEffect(() => {
    const element = sectionRef.current;

    if (!element) return;

    const observer = new ResizeObserver(() => setBounds(measure(element)));

    observer.observe(element);

    return () => observer.disconnect();
  }, [sectionRef]);

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
  const messageDelay = reducedMotion ? 0 : MESSAGE_DELAY_SECONDS;
  const backDelay = reducedMotion ? 0 : BACK_DELAY_SECONDS;

  return (
    <m.div
      ref={root}
      onClick={throwBall}
      className="absolute z-20 cursor-crosshair overflow-hidden select-none"
      style={{
        border: `2px solid ${COLORS.light}`,
        backgroundColor: 'rgb(108 196 106 / 0.13)',
        boxShadow: `0 0 36px 8px ${GLOW}, inset 0 0 90px 10px rgb(108 196 106 / 0.12)`,
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
      <Swarm bounds={bounds} registry={registry} still={reducedMotion} />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-7 px-6 text-center select-none">
        <h2 className="font-heading text-[clamp(2.4rem,7vw,6rem)] leading-[0.95] font-bold tracking-[-0.035em] text-foreground select-none">
          {TITLE.split(' ').map((word, wordIndex, words) => (
            <Fragment key={wordIndex}>
              <span aria-hidden className="inline-block whitespace-nowrap">
                {word.split('').map((letter, letterIndex) => (
                  <m.span
                    key={letterIndex}
                    className="inline-block"
                    initial={
                      reducedMotion
                        ? false
                        : { x: `-${SLIDE_DISTANCE_EM}em`, opacity: 0 }
                    }
                    animate={{ x: '0em', opacity: 1 }}
                    transition={{
                      duration: SLIDE_SECONDS,
                      delay:
                        messageDelay +
                        (words.slice(0, wordIndex).join(' ').length +
                          (wordIndex > 0 ? 1 : 0) +
                          letterIndex) *
                          SLIDE_STAGGER_SECONDS,
                      ease: EASE,
                    }}
                  >
                    {letter}
                  </m.span>
                ))}
              </span>
              {wordIndex < words.length - 1 && ' '}
            </Fragment>
          ))}
          <span className="sr-only">{TITLE}</span>
        </h2>
        <m.div
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: messageDelay + 0.25, ease: EASE }}
        >
          <Button size="lg" asChild>
            <Link to="/maps">
              Explore maps
              <ArrowRight aria-hidden />
            </Link>
          </Button>
        </m.div>
      </div>
      <m.button
        type="button"
        aria-label="Back to the grass"
        onClick={onClose}
        className="absolute top-3 right-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] leading-5 text-muted-foreground opacity-60 outline-none select-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
        initial={reducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 0.6 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: backDelay }}
      >
        <ArrowLeft aria-hidden className="size-3" />
        Back
      </m.button>
    </m.div>
  );
};
