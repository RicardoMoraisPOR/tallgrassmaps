import type { ReactNode } from 'react';

import { m, type MotionValue, useTransform } from 'motion/react';

import { SLAB_RANGE } from './heroMapTimeline';

const SLAB_THICKNESS = 18;

type HeroMapSlabProps = {
  explode: MotionValue<number>;
  children: ReactNode;
};

export const HeroMapSlab = ({ explode, children }: HeroMapSlabProps) => {
  const thickness = useTransform(explode, SLAB_RANGE, [0, SLAB_THICKNESS]);
  const faceOpacity = useTransform(
    explode,
    [SLAB_RANGE[0], SLAB_RANGE[0] + 0.05],
    [0, 1],
  );

  return (
    <div className="relative" style={{ transformStyle: 'preserve-3d' }}>
      {children}
      <m.span
        aria-hidden
        className="absolute top-full left-0 w-full origin-top bg-[#3f9150]"
        style={{ height: thickness, opacity: faceOpacity, rotateX: -90 }}
      />
      <m.span
        aria-hidden
        className="absolute top-0 right-full h-full origin-right bg-[#1f5130]"
        style={{ width: thickness, opacity: faceOpacity, rotateY: -90 }}
      />
    </div>
  );
};
