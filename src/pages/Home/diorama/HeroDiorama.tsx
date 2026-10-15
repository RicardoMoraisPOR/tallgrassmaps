import { type MouseEvent, useEffect, useRef, useState } from 'react';

import { ArrowLeft } from 'lucide-react';
import {
  animate,
  m,
  motionValue,
  useMotionValue,
  useSpring,
  useTransform,
} from 'motion/react';

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { isTouchDevice } from '@/lib/media';

import {
  BASE_TILT_X,
  BASE_TILT_Z,
  PLATFORM_SIZE,
  SCENE_HEIGHT,
  SCENE_WIDTH,
  TOP_Z,
} from './config';
import { Platform } from './Platform';
import { Pokeballs, type Throw } from './Pokeball';
import type { Bounds, CritterHandle } from './Swarm';
import { TallGrass } from './TallGrass';
import { Walkers, type WalkerRegistry } from './Walkers';

const TILT_SPRING = { stiffness: 70, damping: 16, mass: 0.8 };
const POINTER_Z_DEGREES = 8;
const POINTER_X_DEGREES = 3;
const IDLE_SWAY_DEGREES = 5;
const PERSPECTIVE_PIXELS = 1500;
const PLATFORM_DELAY_SECONDS = 0.35;
const MAP_SPRING = { type: 'spring', stiffness: 55, damping: 15 } as const;
const MAP_POINTER_GAIN = 0;
const MAP_SURFACE_Z = 9;
const COLLAPSED_LAYER_SEPARATION = 0.45;
const MAP_SCALE = 1.14;
const BUTTONS_AFTER_MS = 1500;
const HIT_PADDING_PIXELS = 20;
const BALL_START_BELOW_PIXELS = 24;
const TILE_OVERHANG_PIXELS = 5;
const GRASS_LEAVES_SECONDS = 0.55;
const PARK_AFTER_MS = 450;
const HINT_OPACITY = 0.75;

type HeroDioramaProps = {
  onReveal: (tile: DOMRect) => void;
  revealed: boolean;
};

export const HeroDiorama = ({ onReveal, revealed }: HeroDioramaProps) => {
  const reducedMotion = usePrefersReducedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const scaler = useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const idle = useMotionValue(0);
  const progress = useMotionValue(0);
  const [map, setMap] = useState(false);
  const [hintDismissed, setHintDismissed] = useState(false);
  const [settled, setSettled] = useState(false);
  const [throws, setThrows] = useState<Array<Throw>>([]);
  const [bounds, setBounds] = useState<Bounds>({ width: 0, height: 0 });
  const registry = useRef<WalkerRegistry>(new Map());
  const throwCounter = useRef(0);
  const [parked, setParked] = useState(false);
  const world = useRef<HTMLDivElement>(null);
  const pointerX = useSpring(rawX, TILT_SPRING);
  const pointerY = useSpring(rawY, TILT_SPRING);

  const tiltZ = useTransform(progress, (value) => BASE_TILT_Z * (1 - value));
  const tiltX = useTransform(progress, (value) => BASE_TILT_X * (1 - value));
  const gain = useTransform(
    progress,
    (value) => 1 - (1 - MAP_POINTER_GAIN) * value,
  );
  const rotateZ = useTransform(
    [pointerX, idle, tiltZ, gain],
    ([pointer, sway, base, factor]: Array<number>) =>
      base + (pointer * POINTER_Z_DEGREES + sway) * factor,
  );
  const rotateX = useTransform(
    [pointerY, tiltX, gain],
    ([pointer, base, factor]: Array<number>) =>
      base - pointer * POINTER_X_DEGREES * factor,
  );
  const rz = useTransform(rotateZ, (value) => `${value}deg`);
  const rx = useTransform(rotateX, (value) => `${value}deg`);
  const surface = useTransform(
    progress,
    (value) => `${TOP_Z + (MAP_SURFACE_Z - TOP_Z) * value}px`,
  );

  useEffect(() => {
    const controls = animate(progress, map ? 1 : 0, {
      ...MAP_SPRING,
      delay: map ? GRASS_LEAVES_SECONDS : 0,
    });

    return () => controls.stop();
  }, [map, progress]);

  useEffect(() => {
    const element = stage.current;
    const inner = scaler.current;

    if (!element || !inner) return;

    const fit = () => {
      inner.style.setProperty(
        '--scene-scale',
        String(element.clientWidth / SCENE_WIDTH),
      );
      setBounds({ width: element.clientWidth, height: element.clientHeight });
    };
    const observer = new ResizeObserver(fit);

    fit();
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reducedMotion || revealed || isTouchDevice()) return;

    const onMove = (event: PointerEvent) => {
      rawX.set((event.clientX / window.innerWidth - 0.5) * 2);
      rawY.set((event.clientY / window.innerHeight - 0.5) * 2);
    };
    const sway = animate(idle, [-IDLE_SWAY_DEGREES, IDLE_SWAY_DEGREES], {
      duration: 11,
      repeat: Infinity,
      repeatType: 'mirror',
      ease: 'easeInOut',
    });

    window.addEventListener('pointermove', onMove, { passive: true });

    return () => {
      sway.stop();
      window.removeEventListener('pointermove', onMove);
    };
  }, [reducedMotion, revealed, rawX, rawY, idle]);

  useEffect(() => {
    if (!map) return;

    const timer = setTimeout(() => setSettled(true), BUTTONS_AFTER_MS);

    return () => {
      clearTimeout(timer);
      setSettled(false);
    };
  }, [map]);

  useEffect(() => {
    if (!revealed) return;

    const timer = setTimeout(() => setParked(true), PARK_AFTER_MS);

    return () => {
      clearTimeout(timer);
      setParked(false);
      setMap(false);
    };
  }, [revealed]);

  const animated = !reducedMotion;
  const showMore = map && settled && !revealed;
  const showBack = map && settled && !revealed;
  const throwBall = (event: MouseEvent) => {
    const box = stage.current?.getBoundingClientRect();
    const hero = stage.current?.closest('[data-hero]')?.getBoundingClientRect();

    if (!box || !hero) return;

    throwCounter.current += 1;
    setThrows((current) => [
      ...current,
      {
        key: throwCounter.current,
        x: event.clientX - box.left,
        y: event.clientY - box.top,
        from: {
          x: hero.left + hero.width / 2 - box.left,
          y: hero.bottom + BALL_START_BELOW_PIXELS - box.top,
        },
      },
    ]);
  };
  const landOnWalker = ({ x, y }: Throw): CritterHandle | null => {
    const box = stage.current?.getBoundingClientRect();

    if (!box) return null;

    const candidates = [...registry.current.entries()].flatMap(
      ([id, walker]) => {
        const rect = walker.rect();

        if (!rect || walker.busy()) return [];

        const centerX = rect.left + rect.width / 2 - box.left;
        const centerY = rect.top + rect.height / 2 - box.top;

        return [
          {
            id,
            walker,
            centerX,
            centerY,
            distance: Math.hypot(centerX - x, centerY - y),
            reach: Math.max(rect.width, rect.height) / 2 + HIT_PADDING_PIXELS,
          },
        ];
      },
    );
    const hit = candidates
      .filter(({ distance, reach }) => distance <= reach)
      .sort((a, b) => a.distance - b.distance)[0];

    if (!hit) return null;

    hit.walker.capture();

    return {
      id: hit.id,
      x: motionValue(hit.centerX),
      y: motionValue(hit.centerY),
      size: 0,
      busy: () => true,
      capture: () => {},
      finish: (caught) => {
        if (caught) hit.walker.remove();
        else hit.walker.flee();
      },
    };
  };
  const reveal = () => {
    const element = world.current;

    if (!element) return;

    const rect = element.getBoundingClientRect();
    const inflate = (rect.width / PLATFORM_SIZE) * TILE_OVERHANG_PIXELS;

    onReveal(
      new DOMRect(
        rect.left - inflate,
        rect.top - inflate,
        rect.width + inflate * 2,
        rect.height + inflate * 2,
      ),
    );
  };
  const toggle = () => {
    setHintDismissed(true);
    setMap((current) => !current);
  };
  const staticTiltX = map ? 0 : BASE_TILT_X;
  const staticTiltZ = map ? 0 : BASE_TILT_Z;

  return (
    <div
      ref={stage}
      className="pointer-events-none relative mx-auto w-full max-w-[21rem] self-center select-none group-data-[egg=true]/hero:hidden sm:max-w-[26rem] lg:col-span-4 lg:max-w-none"
      style={{
        aspectRatio: `${SCENE_WIDTH} / ${SCENE_HEIGHT}`,
        perspective: PERSPECTIVE_PIXELS,
        opacity: revealed ? 0 : 1,
        visibility: revealed ? 'hidden' : 'visible',
        contentVisibility: parked ? 'hidden' : 'visible',
        transition: `opacity 0.4s ease, visibility 0s linear ${revealed ? 0.4 : 0}s`,
      }}
    >
      <div
        ref={scaler}
        className="absolute top-1/2 left-1/2 origin-center"
        style={{
          width: SCENE_WIDTH,
          height: SCENE_HEIGHT,
          transform:
            'translate(-50%, -50%) scale(var(--scene-scale, 1)) translateY(26px)',
          transformStyle: 'preserve-3d',
        }}
      >
        <m.div
          ref={world}
          aria-hidden
          onClick={map ? throwBall : toggle}
          className={`pointer-events-auto absolute ${map ? 'cursor-crosshair' : 'cursor-pointer'}`}
          style={{
            left: (SCENE_WIDTH - PLATFORM_SIZE) / 2,
            top: (SCENE_HEIGHT - PLATFORM_SIZE) / 2,
            width: PLATFORM_SIZE,
            height: PLATFORM_SIZE,
            rotateX: animated ? rotateX : staticTiltX,
            rotateZ: animated ? rotateZ : staticTiltZ,
            transformStyle: 'preserve-3d',
            ['--rx' as string]: animated ? rx : `${staticTiltX}deg`,
            ['--rz' as string]: animated ? rz : `${staticTiltZ}deg`,
            ['--surface' as string]: animated
              ? surface
              : `${map ? MAP_SURFACE_Z : TOP_Z}px`,
            ['--build' as string]: map ? 0 : 1,
            ['--sep' as string]: `${map ? COLLAPSED_LAYER_SEPARATION : 0}px`,
          }}
          initial={animated ? { scale: 0.9 } : false}
          animate={{ scale: map ? MAP_SCALE : 1 }}
          transition={
            map || !animated
              ? { ...MAP_SPRING, delay: map ? GRASS_LEAVES_SECONDS : 0 }
              : {
                  duration: 1,
                  delay: PLATFORM_DELAY_SECONDS,
                  ease: [0.16, 1, 0.3, 1],
                }
          }
        >
          <Platform animated={animated} map={map} />
          <TallGrass animated={animated} map={map} />
          {animated && !revealed && <Walkers map={map} registry={registry} />}
        </m.div>
      </div>
      <Pokeballs
        throws={throws}
        bounds={bounds}
        onLand={landOnWalker}
        follow={() => undefined}
        onDone={(key) =>
          setThrows((current) => current.filter((item) => item.key !== key))
        }
      />
      <button
        type="button"
        aria-pressed={map}
        onClick={toggle}
        className="sr-only"
      >
        {map ? 'Back to the grass' : 'Scan the grass'}
      </button>
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full border bg-card/90 px-3 py-1 text-[11px] leading-5 whitespace-nowrap text-muted-foreground transition-opacity duration-500 motion-safe:animate-in motion-safe:delay-[3200ms] motion-safe:duration-700 motion-safe:fill-mode-backwards motion-safe:fade-in motion-reduce:transition-none"
        style={{
          opacity: hintDismissed ? 0 : HINT_OPACITY,
          visibility: hintDismissed ? 'hidden' : 'visible',
          transition: `opacity 0.4s ease, visibility 0s linear ${hintDismissed ? 0.4 : 0}s`,
        }}
      >
        Scan the grass
      </span>
      <div className="pointer-events-none absolute -bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2">
        {showBack && (
          <button
            type="button"
            onClick={toggle}
            className="pointer-events-auto inline-flex items-center gap-1 rounded-full border bg-card px-3 py-1.5 text-xs font-medium whitespace-nowrap text-foreground outline-none hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-safe:animate-in motion-safe:fade-in"
          >
            <ArrowLeft aria-hidden className="size-3" />
            Back to the grass
          </button>
        )}
        {showMore && (
          <button
            type="button"
            onClick={reveal}
            className="pointer-events-auto rounded-full border border-brand bg-card px-4 py-1.5 text-xs font-medium whitespace-nowrap text-foreground outline-none hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-safe:animate-in motion-safe:zoom-in-90 motion-safe:fade-in"
          >
            Expand
          </button>
        )}
      </div>
    </div>
  );
};
