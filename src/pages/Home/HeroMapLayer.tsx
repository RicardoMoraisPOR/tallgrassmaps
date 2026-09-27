import type { ReactNode } from 'react';

import { m, type MotionValue, useTransform } from 'motion/react';

import { layerRange, timelineEase } from './heroMapTimeline';

const LAYER_GAP = 40;

type HeroMapLayerProps = {
  explode: MotionValue<number>;
  index: number;
  label?: string;
  plate?: boolean;
  guide?: { left: string; top: string };
  marks?: ReactNode;
  swap?: { from: ReactNode; to: ReactNode };
  children?: ReactNode;
};

export const HeroMapLayer = ({
  explode,
  index,
  label,
  plate = false,
  guide,
  marks,
  swap,
  children,
}: HeroMapLayerProps) => {
  const progress = useTransform(explode, layerRange(index), [0, 1], {
    ease: timelineEase,
  });
  const z = useTransform(progress, [0, 1], [0, (index + 1) * LAYER_GAP]);
  const fadeOut = useTransform(progress, [0, 0.6], [1, 0]);
  const fadeIn = useTransform(progress, [0.4, 1], [0, 1]);

  return (
    <m.div
      aria-hidden
      className="@container pointer-events-none absolute inset-0"
      style={{ translateZ: z, transformStyle: 'preserve-3d' }}
    >
      {plate && (
        <m.div
          className="absolute inset-0 rounded-[3px] border border-brand/60 bg-brand/8"
          style={{ opacity: progress }}
        >
          {label && (
            <span className="absolute top-[3cqw] left-[3.5cqw] font-mono text-[3.2cqw] leading-none font-medium tracking-[0.2em] text-brand uppercase">
              {label}
            </span>
          )}
          {marks}
        </m.div>
      )}
      {guide && (
        <m.span
          className="absolute w-0 origin-top border-l-2 border-dashed border-brand"
          style={{
            left: guide.left,
            top: guide.top,
            height: z,
            rotateX: -90,
            opacity: progress,
          }}
        />
      )}
      {swap && (
        <>
          <m.div className="absolute inset-0" style={{ opacity: fadeOut }}>
            {swap.from}
          </m.div>
          <m.div className="absolute inset-0" style={{ opacity: fadeIn }}>
            {swap.to}
          </m.div>
        </>
      )}
      {children}
    </m.div>
  );
};
