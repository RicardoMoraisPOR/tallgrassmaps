import { useEffect, useState } from 'react';

import type { SpriteAnimation } from '@/data/maps';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { reducedMotionQuery } from '@/lib/motion';
import { cn } from '@/lib/utils';

type AnimatedSpriteProps = {
  animation: SpriteAnimation;
  blink?: { visibleMs: number; hiddenMs: number };
  pixelated: boolean;
  className?: string;
};

export const AnimatedSprite = ({
  animation,
  blink,
  pixelated,
  className,
}: AnimatedSpriteProps) => {
  const reducedMotion = usePrefersReducedMotion();
  const systemReducedMotion = useMediaQuery(reducedMotionQuery);

  const frame = useFrame(animation, reducedMotion);
  const visible = useBlink(blink, systemReducedMotion);

  return (
    <span
      aria-hidden
      className={cn('pointer-events-none absolute inset-0', className)}
      style={{ visibility: visible ? undefined : 'hidden' }}
    >
      {animation.frames.map((src, index) => (
        <img
          key={src}
          src={src}
          alt=""
          draggable={false}
          className={cn(
            'absolute inset-0 size-full max-w-none select-none',
            pixelated && 'pixelated',
          )}
          style={{ visibility: index === frame ? undefined : 'hidden' }}
        />
      ))}
    </span>
  );
};

const useFrame = ({ frames, frameMs }: SpriteAnimation, paused: boolean) => {
  const [frame, setFrame] = useState(0);

  const animated = frames.length > 1 && frameMs !== undefined && !paused;

  useEffect(() => {
    if (!animated) return;

    const interval = setInterval(
      () => setFrame((current) => (current + 1) % frames.length),
      frameMs,
    );

    return () => clearInterval(interval);
  }, [animated, frames.length, frameMs]);

  return animated ? frame : 0;
};

const useBlink = (blink: AnimatedSpriteProps['blink'], paused: boolean) => {
  const [visible, setVisible] = useState(true);

  const blinking = blink !== undefined && !paused;

  useEffect(() => {
    if (!blinking) return;

    const timeout = setTimeout(
      () => setVisible((current) => !current),
      visible ? blink.visibleMs : blink.hiddenMs,
    );

    return () => clearTimeout(timeout);
  }, [blinking, blink, visible]);

  return !blinking || visible;
};
