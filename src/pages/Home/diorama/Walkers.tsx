import { type RefObject, useEffect, useRef, useState } from 'react';

import { animate, m, useMotionValue } from 'motion/react';

import { getSpecies, species as allSpecies } from '@/data/pokedex/master';
import { pokeapiSprite } from '@/data/sprites';

import { Billboard } from './Billboard';
import { MAP_SPRITE_SCALE, random, WALK_BOUNDS } from './config';

const MAX_WALKERS = 3;
const FIRST_SPAWN_MS = 2300;
const SPEED_PIXELS_PER_SECOND = 34;
const SPRITE_SIZE = 92;
const MIN_STOPS = 2;
const MAX_STOPS = 4;
const LEADER_LINE_PIXELS = 40;
const LEADER_LINE_STEP_PIXELS = 17;
const MAP_REVEAL_SECONDS = 1.55;
const CATCH_PADDING_PIXELS = 26;
const CATCH_ZONE_PIXELS =
  SPRITE_SIZE * MAP_SPRITE_SCALE + CATCH_PADDING_PIXELS * 2;

const randomSpecies = () =>
  allSpecies[Math.floor(random(0, allSpecies.length))].number;

const randomPoint = () => ({
  x: random(WALK_BOUNDS.minX, WALK_BOUNDS.maxX),
  y: random(WALK_BOUNDS.minY, WALK_BOUNDS.maxY),
});

const edgePoint = () =>
  random(0, 1) < 0.5
    ? { x: random(WALK_BOUNDS.minX, WALK_BOUNDS.maxX), y: WALK_BOUNDS.minY }
    : { x: WALK_BOUNDS.maxX, y: random(WALK_BOUNDS.minY, WALK_BOUNDS.maxY) };

let lastKey = 0;

const fillTo = (current: Array<Sighting>, total: number) => {
  const added = Array.from(
    { length: Math.max(0, total - current.length) },
    (): Sighting => {
      lastKey += 1;

      return {
        key: lastKey,
        species: randomSpecies(),
        level: Math.round(random(3, 72)),
      };
    },
  );

  return added.length ? [...current, ...added] : current;
};

const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

type Sighting = {
  key: number;
  species: number;
  level: number;
};

export type WalkerHandle = { hide: () => void; remove: () => void };

export type WalkerRegistry = Map<number, WalkerHandle>;

type LabelProps = { sighting: Sighting; show: boolean };

const MapLabel = ({ sighting, show }: LabelProps) => {
  const lineHeight =
    LEADER_LINE_PIXELS + (sighting.key % 3) * LEADER_LINE_STEP_PIXELS;
  const reveal = (delay: number) => (show ? delay : 0);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-1/2 flex -translate-x-1/2 flex-col items-center"
      style={{
        bottom: SPRITE_SIZE * MAP_SPRITE_SCALE + 2,
        visibility: show ? 'visible' : 'hidden',
        transition: `visibility 0s linear ${show ? 0 : 0.5}s`,
      }}
    >
      <div
        className="rounded-md border bg-card/95 px-2 py-1 text-center text-[10px] leading-tight whitespace-nowrap text-foreground shadow-sm motion-reduce:transition-none"
        style={{
          transformOrigin: '50% 100%',
          opacity: show ? 1 : 0,
          transform: show ? 'scale(1)' : 'scale(0.6)',
          transition: `opacity 0.3s ease ${reveal(MAP_REVEAL_SECONDS + 0.45)}s, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) ${reveal(MAP_REVEAL_SECONDS + 0.45)}s`,
        }}
      >
        <div className="font-semibold">
          {getSpecies(sighting.species)?.name}
        </div>
        <div className="text-muted-foreground tabular-nums">
          Lv. {sighting.level}
        </div>
      </div>
      <div
        className="w-px bg-foreground motion-reduce:transition-none"
        style={{
          height: lineHeight,
          transformOrigin: '50% 100%',
          transform: show ? 'scaleY(1)' : 'scaleY(0)',
          transition: `transform 0.45s cubic-bezier(0.22, 1, 0.36, 1) ${reveal(MAP_REVEAL_SECONDS)}s`,
        }}
      />
    </div>
  );
};

type WalkerProps = {
  sighting: Sighting;
  map: boolean;
  registry: RefObject<WalkerRegistry>;
  onCatch: (sighting: Sighting, sprite: DOMRect) => void;
  onDone: () => void;
  onCaught: () => void;
};

const Walker = ({
  sighting,
  map,
  registry,
  onCatch,
  onDone,
  onCaught,
}: WalkerProps) => {
  const [start] = useState(edgePoint);
  const done = useRef(onDone);
  const caught = useRef(onCaught);
  const mapRef = useRef(map);
  const halted = useRef(false);
  const [locked, setLocked] = useState(false);
  const running = useRef<Array<{ stop: () => void }>>([]);
  const x = useMotionValue(start.x);
  const y = useMotionValue(start.y);
  const [facing, setFacing] = useState(1);
  const [moving, setMoving] = useState(false);
  const [visible, setVisible] = useState(false);
  const shadowShown = visible && !map;

  useEffect(() => {
    done.current = onDone;
    caught.current = onCaught;
    mapRef.current = map;
  }, [onDone, onCaught, map]);

  useEffect(() => {
    const registered = registry.current;

    registered.set(sighting.key, {
      hide: () => setVisible(false),
      remove: () => caught.current(),
    });

    return () => {
      registered.delete(sighting.key);
    };
  }, [registry, sighting.key]);

  useEffect(() => {
    let cancelled = false;
    const interrupted = () => cancelled || halted.current;

    const walkTo = async (target: { x: number; y: number }) => {
      const dx = target.x - x.get();
      const dy = target.y - y.get();
      const seconds = Math.hypot(dx, dy) / SPEED_PIXELS_PER_SECOND;
      const ease = mapRef.current ? 'easeInOut' : 'linear';

      setFacing(dx + dy >= 0 ? 1 : -1);
      setMoving(true);

      const controls = [
        animate(x, target.x, { duration: seconds, ease }),
        animate(y, target.y, { duration: seconds, ease }),
      ];

      running.current = controls;
      await Promise.all(controls);
      setMoving(false);
    };

    const life = async () => {
      setVisible(true);
      await wait(450);

      const stops = Math.floor(random(MIN_STOPS, MAX_STOPS + 1));

      for (
        let stop = 0;
        (mapRef.current || stop < stops) && !interrupted();
        stop++
      ) {
        await walkTo(randomPoint());
        await wait(random(500, 1400));
      }

      if (!interrupted()) await walkTo(edgePoint());
      if (interrupted()) return;

      setVisible(false);
      await wait(450);

      if (!interrupted()) done.current();
    };

    void life();

    return () => {
      cancelled = true;
      running.current.forEach((controls) => controls.stop());
    };
  }, [x, y]);

  const targeted = () => {
    halted.current = true;
    running.current.forEach((controls) => controls.stop());
    setMoving(false);
    setLocked(true);
  };
  const catchable = map && visible && !locked;

  return (
    <m.div
      className="absolute top-0 left-0"
      style={{ x, y, transformStyle: 'preserve-3d' }}
    >
      <div
        aria-hidden
        className="absolute motion-reduce:transition-none"
        style={{
          left: -26,
          top: -10,
          width: 52,
          height: 20,
          background:
            'radial-gradient(ellipse at center, rgb(15 42 26 / 0.45) 0%, rgb(15 42 26 / 0.28) 48%, transparent 72%)',
          opacity: shadowShown ? 1 : 0,
          visibility: shadowShown ? 'visible' : 'hidden',
          transition: `opacity 0.5s ease, visibility 0s linear ${shadowShown ? 0 : 0.5}s`,
          transform: 'translateZ(calc(var(--surface, 0px) + 0.5px))',
        }}
      />
      <Billboard x={0} y={0} width={SPRITE_SIZE} height={SPRITE_SIZE} lift={1}>
        <div className="relative size-full">
          <div
            className="size-full motion-reduce:transition-none"
            style={{
              transformOrigin: '50% 100%',
              transform: `scale(${map ? MAP_SPRITE_SCALE : 1})`,
              transition: 'transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            <m.div
              className="size-full"
              style={{ transformOrigin: '50% 100%' }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: visible ? 1 : 0, opacity: visible ? 1 : 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 16 }}
            >
              <m.img
                src={pokeapiSprite(sighting.species)}
                alt=""
                draggable={false}
                className="size-full [image-rendering:pixelated]"
                style={{ scaleX: facing }}
                animate={{ y: moving && !map ? [0, -5, 0] : 0 }}
                transition={
                  moving && !map
                    ? { duration: 0.46, repeat: Infinity, ease: 'easeOut' }
                    : { duration: 0.15 }
                }
              />
            </m.div>
          </div>
          <MapLabel sighting={sighting} show={map && visible} />
          {catchable && (
            <div
              aria-hidden
              className="absolute left-1/2 cursor-pointer"
              style={{
                width: CATCH_ZONE_PIXELS,
                height: CATCH_ZONE_PIXELS,
                bottom: -CATCH_PADDING_PIXELS,
                transform: 'translateX(-50%)',
              }}
              onClick={(event) => {
                event.stopPropagation();
                targeted();
                onCatch(sighting, event.currentTarget.getBoundingClientRect());
              }}
            />
          )}
        </div>
      </Billboard>
    </m.div>
  );
};

type WalkersProps = {
  map: boolean;
  registry: RefObject<WalkerRegistry>;
  onCatch: (sighting: Sighting, sprite: DOMRect) => void;
  onCleared: (cleared: boolean) => void;
};

export const Walkers = ({
  map,
  registry,
  onCatch,
  onCleared,
}: WalkersProps) => {
  const [walkers, setWalkers] = useState<Array<Sighting>>([]);
  const [caught, setCaught] = useState(0);
  const [started, setStarted] = useState(false);
  const target = map ? MAX_WALKERS - caught : MAX_WALKERS;

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), FIRST_SPAWN_MS);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!map && !started) return;

    setWalkers((current) => fillTo(current, target));
  }, [map, started, target, walkers.length]);

  useEffect(() => {
    if (!map) return;

    return () => {
      setWalkers([]);
      setCaught(0);
    };
  }, [map]);

  useEffect(() => {
    onCleared(map && caught >= MAX_WALKERS);
  }, [map, caught, onCleared]);

  return (
    <>
      {walkers.map((sighting) => (
        <Walker
          key={sighting.key}
          sighting={sighting}
          map={map}
          registry={registry}
          onCatch={onCatch}
          onDone={() =>
            setWalkers((current) =>
              current.filter((item) => item.key !== sighting.key),
            )
          }
          onCaught={() => {
            setWalkers((current) =>
              current.filter((item) => item.key !== sighting.key),
            );
            setCaught((current) => current + 1);
          }}
        />
      ))}
    </>
  );
};
