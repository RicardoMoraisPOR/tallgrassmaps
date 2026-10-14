import { type RefObject, useEffect, useRef, useState } from 'react';

import { animate, m, type MotionValue, useMotionValue } from 'motion/react';

import { species as allSpecies } from '@/data/pokedex/master';
import { pokeapiSprite } from '@/data/sprites';

import { random } from './config';

const EDGE_PADDING = 28;
const MIN_SPEED = 34;
const MAX_SPEED = 92;
const MIN_LEG_PIXELS = 110;
const FLEE_SECONDS = 0.85;
const BREAK_FREE_SECONDS = 0.7;
const FLEE_MARGIN = 70;
const EASES: Array<'linear' | [number, number, number, number]> = [
  'linear',
  [0.3, 0.15, 0.7, 0.85],
  [0.45, 0.1, 0.55, 0.9],
  [0.2, 0.3, 0.8, 0.7],
];
const FIRST_POP_SECONDS = 0.9;
const POP_STAGGER_SECONDS = 0.045;
const MIN_SIZE = 38;
const MAX_SIZE = 58;
const AREA_PER_CRITTER = 20000;
const MIN_CRITTERS = 14;
const MAX_CRITTERS = 72;
const MESSAGE_HALF_WIDTH = 500;
const MESSAGE_HALF_HEIGHT = 120;

export type Bounds = { width: number; height: number };

export type CritterHandle = {
  id: number;
  x: MotionValue<number>;
  y: MotionValue<number>;
  size: number;
  busy: () => boolean;
  capture: () => void;
  finish: (caught: boolean) => void;
};

export type Registry = Map<number, CritterHandle>;

const randomSpecies = () =>
  allSpecies[Math.floor(random(0, allSpecies.length))].number;

const randomPoint = ({ width, height }: Bounds) => {
  const halfWidth = Math.min(MESSAGE_HALF_WIDTH, width * 0.42);
  const halfHeight = Math.min(MESSAGE_HALF_HEIGHT, height * 0.2);

  for (let attempt = 0; attempt < 30; attempt++) {
    const x = random(
      EDGE_PADDING,
      Math.max(EDGE_PADDING + 1, width - EDGE_PADDING),
    );
    const y = random(
      EDGE_PADDING,
      Math.max(EDGE_PADDING + 1, height - EDGE_PADDING),
    );

    if (
      Math.abs(x - width / 2) > halfWidth ||
      Math.abs(y - height / 2) > halfHeight
    )
      return { x, y };
  }

  return { x: EDGE_PADDING, y: EDGE_PADDING };
};

const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

type CritterProps = {
  id: number;
  index: number;
  fresh: boolean;
  initialBounds: Bounds;
  boundsRef: RefObject<Bounds>;
  registry: RefObject<Registry>;
  still: boolean;
  onGone: (id: number) => void;
};

const Critter = ({
  id,
  index,
  fresh,
  initialBounds,
  boundsRef,
  registry,
  still,
  onGone,
}: CritterProps) => {
  const [species] = useState(randomSpecies);
  const [size] = useState(() => Math.round(random(MIN_SIZE, MAX_SIZE)));
  const [start] = useState(() => randomPoint(initialBounds));
  const x = useMotionValue(start.x);
  const y = useMotionValue(start.y);
  const [facing, setFacing] = useState(1);
  const [held, setHeld] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [breakingFree, setBreakingFree] = useState(false);
  const locked = useRef(false);
  const running = useRef<Array<{ stop: () => void }>>([]);
  const gone = useRef(onGone);
  const popDelay = fresh
    ? 0.1
    : FIRST_POP_SECONDS + index * POP_STAGGER_SECONDS;

  useEffect(() => {
    gone.current = onGone;
  }, [onGone]);

  useEffect(() => {
    if (still) return;

    let cancelled = false;

    const wander = async () => {
      await wait(popDelay * 1000);

      while (!cancelled && !locked.current) {
        let target = randomPoint(boundsRef.current);

        for (let attempt = 0; attempt < 6; attempt++) {
          if (
            Math.hypot(target.x - x.get(), target.y - y.get()) >= MIN_LEG_PIXELS
          )
            break;

          target = randomPoint(boundsRef.current);
        }

        const dx = target.x - x.get();
        const dy = target.y - y.get();
        const seconds = Math.max(
          0.6,
          Math.hypot(dx, dy) / random(MIN_SPEED, MAX_SPEED),
        );
        const ease = EASES[Math.floor(random(0, EASES.length))];

        setFacing(dx >= 0 ? 1 : -1);

        const controls = [
          animate(x, target.x, { duration: seconds, ease }),
          animate(y, target.y, { duration: seconds, ease }),
        ];

        running.current = controls;
        await Promise.all(controls);
      }
    };

    void wander();

    return () => {
      cancelled = true;
      running.current.forEach((controls) => controls.stop());
    };
  }, [popDelay, still, x, y, boundsRef]);

  useEffect(() => {
    const registered = registry.current;

    registered.set(id, {
      id,
      x,
      y,
      size,
      busy: () => locked.current,
      capture: () => {
        locked.current = true;
        running.current.forEach((controls) => controls.stop());
        setHeld(true);
      },
      finish: (caught) => {
        if (caught) {
          gone.current(id);

          return;
        }

        const { width } = boundsRef.current;
        const exit = x.get() < width / 2 ? -FLEE_MARGIN : width + FLEE_MARGIN;

        setFacing(exit > x.get() ? 1 : -1);
        setHeld(false);
        setBreakingFree(true);
        setTimeout(() => {
          setBreakingFree(false);
          setLeaving(true);
          running.current = [
            animate(x, exit, { duration: FLEE_SECONDS, ease: 'easeIn' }),
            animate(y, y.get() + random(-60, 60), {
              duration: FLEE_SECONDS,
              ease: 'easeOut',
            }),
          ];
        }, BREAK_FREE_SECONDS * 1000);
        setTimeout(
          () => gone.current(id),
          (BREAK_FREE_SECONDS + FLEE_SECONDS) * 1000,
        );
      },
    });

    return () => {
      registered.delete(id);
    };
  }, [id, x, y, size, registry, boundsRef]);

  return (
    <m.div
      aria-hidden
      className="pointer-events-none absolute top-0 left-0"
      style={{ x, y, marginLeft: -size / 2, marginTop: -size / 2 }}
      initial={still ? false : { scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 240,
        damping: 16,
        delay: popDelay,
      }}
    >
      <m.img
        src={pokeapiSprite(species)}
        alt=""
        width={size}
        height={size}
        draggable={false}
        className="[image-rendering:pixelated]"
        style={{ width: size, height: size, scaleX: facing }}
        animate={
          held
            ? { scale: 0, opacity: 0, filter: 'brightness(3)' }
            : breakingFree
              ? {
                  scale: [0.3, 1.3, 1],
                  opacity: 1,
                  y: [0, -16, 0, -6, 0],
                  rotate: [0, -14, 14, -10, 10, 0],
                  filter: ['brightness(3)', 'brightness(1)', 'brightness(1)'],
                }
              : leaving
                ? { scale: 1, opacity: 0, filter: 'brightness(1)' }
                : { scale: 1, opacity: 1, filter: 'brightness(1)' }
        }
        transition={
          breakingFree
            ? { duration: BREAK_FREE_SECONDS, ease: 'easeOut' }
            : leaving
              ? { duration: FLEE_SECONDS, ease: 'easeIn' }
              : { duration: held ? 0.22 : 0.18 }
        }
      />
    </m.div>
  );
};

type Slot = { id: number; fresh: boolean };

export const Swarm = ({
  bounds,
  registry,
  still,
}: {
  bounds: Bounds;
  registry: RefObject<Registry>;
  still: boolean;
}) => {
  const boundsRef = useRef(bounds);
  const count = Math.max(
    MIN_CRITTERS,
    Math.min(
      MAX_CRITTERS,
      Math.round((bounds.width * bounds.height) / AREA_PER_CRITTER),
    ),
  );
  const [slots, setSlots] = useState(() => ({
    list: Array.from({ length: count }, (_, id): Slot => ({
      id,
      fresh: false,
    })),
    next: count,
  }));

  if (slots.list.length < count) {
    const extra = Array.from(
      { length: count - slots.list.length },
      (_, offset): Slot => ({ id: slots.next + offset, fresh: true }),
    );

    setSlots({
      list: [...slots.list, ...extra],
      next: slots.next + extra.length,
    });
  }

  useEffect(() => {
    boundsRef.current = bounds;
  }, [bounds]);

  const replace = (id: number) =>
    setSlots((current) => ({
      list: current.list.map((slot) =>
        slot.id === id ? { id: current.next, fresh: true } : slot,
      ),
      next: current.next + 1,
    }));

  return (
    <>
      {slots.list.slice(0, count).map(({ id, fresh }, index) => (
        <Critter
          key={id}
          id={id}
          index={index}
          fresh={fresh}
          initialBounds={bounds}
          boundsRef={boundsRef}
          registry={registry}
          still={still}
          onGone={replace}
        />
      ))}
    </>
  );
};
