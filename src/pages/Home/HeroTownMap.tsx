import type { PointerEvent } from 'react';

import {
  m,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'motion/react';

import { RegionImage } from '@/components/map/RegionImage';
import { getHotspot, getLocation, type Region } from '@/data/maps';

const TILT_DEGREES = 8;

const spring = { stiffness: 150, damping: 18, mass: 0.4 };

type HeroTownMapProps = {
  region: Region;
  focus: string;
};

export const HeroTownMap = ({ region, focus }: HeroTownMapProps) => {
  const reducedMotion = useReducedMotion();
  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const hovered = useMotionValue(0);
  const x = useSpring(pointerX, spring);
  const y = useSpring(pointerY, spring);
  const highlight = useSpring(hovered, spring);
  const rotateX = useTransform(y, [0, 1], [TILT_DEGREES, -TILT_DEGREES]);
  const rotateY = useTransform(x, [0, 1], [-TILT_DEGREES, TILT_DEGREES]);
  const sheenX = useTransform(x, [0, 1], ['0%', '100%']);
  const sheenY = useTransform(y, [0, 1], ['0%', '100%']);
  const glowScale = useTransform(highlight, [0, 1], [1, 1.12]);
  const sheen = useMotionTemplate`radial-gradient(circle at ${sheenX} ${sheenY}, oklch(1 0 0 / 0.45), transparent 60%)`;

  const hotspot = getHotspot(region, focus);
  const location = getLocation(region, focus);

  const track = (event: PointerEvent<HTMLDivElement>) => {
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

  return (
    <figure className="relative m-0 flex flex-col items-center gap-3">
      <m.div
        aria-hidden
        className="absolute top-[46%] left-1/2 -z-10 aspect-square w-[78%] -translate-1/2 rounded-full blur-[40px]"
        style={{
          scale: glowScale,
          background:
            'radial-gradient(circle, oklch(0.74 0.15 145 / 0.55), oklch(0.74 0.15 145 / 0) 65%)',
        }}
      />
      <m.div
        className="w-full max-w-110"
        style={{ rotateX, rotateY, transformPerspective: 900 }}
        onPointerMove={track}
        onPointerLeave={reset}
      >
        <RegionImage
          region={region}
          alt={`${region.name} Town Map with the cursor on ${location?.name}`}
          locationName={location?.name}
          hotspot={hotspot}
          className="overflow-hidden border shadow-[0_30px_60px_-30px_oklch(0_0_0/0.45)]"
        >
          <m.span
            aria-hidden
            className="pointer-events-none absolute inset-0 mix-blend-soft-light"
            style={{ background: sheen, opacity: highlight }}
          />
        </RegionImage>
      </m.div>
      <figcaption className="text-xs text-muted-foreground">
        {region.name}&apos;s Town Map, from{' '}
        <a
          href={region.source.url}
          target="_blank"
          rel="noreferrer"
          className="text-foreground underline underline-offset-3"
        >
          {region.source.name}
        </a>{' '}
        ({region.source.credit})
      </figcaption>
    </figure>
  );
};
