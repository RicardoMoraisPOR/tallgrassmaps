import {
  type PointerEvent,
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  animate,
  m,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from 'motion/react';

import { getHotspot, getLocation, type Region } from '@/data/maps';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

import { HeroMapStack } from './HeroMapStack';
import {
  COLLAPSE_SECONDS,
  EXPLODE_SECONDS,
  INTRO_EXPLODE_SECONDS,
  LAYER_START,
  MAP_SWAP_IN_SECONDS,
  MAP_SWAP_OUT_SECONDS,
  STAGE_RANGE,
  timelineEase,
} from './heroMapTimeline';

const TILT_DEGREES = 8;
const EXPLODED_TILT_DEGREES = 4;
const ISO_ROTATE_X = 56;
const ISO_ROTATE_Z = -42;
const EXPLODED_SCALE = 0.72;
const EXPLODED_OFFSET_Y = 72;
const PERSPECTIVE = 900;
const EXPLODED_PERSPECTIVE = 2600;
const INTRO_DELAY_MS = 500;
const EXPLODED_GLOW_OPACITY = 0.55;

const spring = { stiffness: 150, damping: 18, mass: 0.4 };

const mix = (from: number, to: number, amount: number) =>
  from + (to - from) * amount;

type HeroTownMapProps = {
  region: Region;
  focus: string;
};

export const HeroTownMap = ({ region, focus }: HeroTownMapProps) => {
  const reducedMotion = usePrefersReducedMotion();
  const [exploded, setExploded] = useState(false);
  const [touched, setTouched] = useState(false);
  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const hovered = useMotionValue(0);
  const explode = useMotionValue(0);
  const mapSwap = useMotionValue(0);
  const stage = useTransform(explode, STAGE_RANGE, [0, 1], {
    ease: timelineEase,
  });
  const x = useSpring(pointerX, spring);
  const y = useSpring(pointerY, spring);
  const highlight = useSpring(hovered, spring);
  const rotateX = useTransform([y, stage], ([ty, e]: Array<number>) =>
    mix(
      mix(TILT_DEGREES, -TILT_DEGREES, ty),
      ISO_ROTATE_X + mix(EXPLODED_TILT_DEGREES, -EXPLODED_TILT_DEGREES, ty),
      e,
    ),
  );
  const rotateY = useTransform([x, stage], ([tx, e]: Array<number>) =>
    mix(mix(-TILT_DEGREES, TILT_DEGREES, tx), 0, e),
  );
  const rotateZ = useTransform([x, stage], ([tx, e]: Array<number>) =>
    mix(
      0,
      ISO_ROTATE_Z + mix(-EXPLODED_TILT_DEGREES, EXPLODED_TILT_DEGREES, tx),
      e,
    ),
  );
  const scale = useTransform(stage, [0, 1], [1, EXPLODED_SCALE]);
  const offsetY = useTransform(stage, [0, 1], [0, EXPLODED_OFFSET_Y]);
  const perspective = useTransform(
    stage,
    [0, 1],
    [PERSPECTIVE, EXPLODED_PERSPECTIVE],
  );
  const sheenX = useTransform(x, [0, 1], ['0%', '100%']);
  const sheenY = useTransform(y, [0, 1], ['0%', '100%']);
  const sheenOpacity = useTransform(
    [highlight, stage],
    ([h, e]: Array<number>) => h * (1 - e),
  );
  const glowScale = useTransform(highlight, [0, 1], [1, 1.12]);
  const glowOpacity = useTransform(stage, [0, 1], [1, EXPLODED_GLOW_OPACITY]);
  const sheen = useMotionTemplate`radial-gradient(circle at ${sheenX} ${sheenY}, oklch(1 0 0 / 0.45), transparent 60%)`;

  const hotspot = getHotspot(region, focus);
  const location = getLocation(region, focus);

  const track = (event: PointerEvent<HTMLButtonElement>) => {
    if (reducedMotion || event.pointerType !== 'mouse') return;

    const bounds = event.currentTarget.getBoundingClientRect();

    pointerX.set((event.clientX - bounds.left) / bounds.width);
    pointerY.set((event.clientY - bounds.top) / bounds.height);
    hovered.set(1);
  };

  const reset = () => {
    pointerX.set(0.5);
    pointerY.set(0.5);
    hovered.set(0);
  };

  const swapInMap = useCallback(
    (explodeSeconds: number) => {
      animate(mapSwap, 1, {
        delay: explodeSeconds * LAYER_START,
        duration: reducedMotion ? 0 : MAP_SWAP_IN_SECONDS,
        ease: 'easeInOut',
      });
    },
    [mapSwap, reducedMotion],
  );

  useEffect(() => {
    if (reducedMotion || touched) return;

    const timer = setTimeout(() => {
      setTouched(true);
      setExploded(true);
      animate(explode, 1, {
        duration: INTRO_EXPLODE_SECONDS,
        ease: 'linear',
      });
      swapInMap(INTRO_EXPLODE_SECONDS);
    }, INTRO_DELAY_MS);

    return () => clearTimeout(timer);
  }, [reducedMotion, touched, explode, swapInMap]);

  const toggle = () => {
    const next = !exploded;

    setTouched(true);
    setExploded(next);

    if (next) swapInMap(reducedMotion ? 0 : EXPLODE_SECONDS);
    else
      animate(mapSwap, 0, {
        duration: reducedMotion ? 0 : MAP_SWAP_OUT_SECONDS,
        ease: 'easeOut',
      });

    animate(explode, next ? 1 : 0, {
      duration: reducedMotion ? 0 : next ? EXPLODE_SECONDS : COLLAPSE_SECONDS,
      ease: 'linear',
    });
  };

  return (
    <figure className="relative m-0 flex flex-col items-center gap-3">
      <m.div
        aria-hidden
        className="absolute top-[46%] left-1/2 -z-10 aspect-square w-[78%] -translate-1/2 rounded-full blur-[40px]"
        style={{
          scale: glowScale,
          opacity: glowOpacity,
          background:
            'radial-gradient(circle, oklch(0.74 0.15 145 / 0.55), oklch(0.74 0.15 145 / 0) 65%)',
        }}
      />
      <m.button
        type="button"
        aria-label={exploded ? 'Hide map layers' : 'Show map layers'}
        aria-pressed={exploded}
        onClick={toggle}
        onPointerMove={track}
        onPointerLeave={reset}
        className="group/hero block w-full max-w-110 cursor-pointer rounded-[3px] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
        style={{
          rotateX,
          rotateY,
          rotateZ,
          scale,
          y: offsetY,
          transformPerspective: perspective,
          transformStyle: 'preserve-3d',
        }}
      >
        <HeroMapStack
          region={region}
          alt={`${region.name} Town Map with the cursor on ${location?.name}`}
          hotspot={hotspot}
          locationName={location?.name}
          explode={explode}
          mapSwap={mapSwap}
        >
          <m.span
            aria-hidden
            className="pointer-events-none absolute inset-0 mix-blend-soft-light"
            style={{ background: sheen, opacity: sheenOpacity }}
          />
        </HeroMapStack>
      </m.button>
    </figure>
  );
};
