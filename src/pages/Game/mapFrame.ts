import { useLayoutEffect, useRef } from 'react';

import { animate } from 'motion/react';

import { easeOutSoft, prefersReducedMotion } from '@/lib/motion';

const FRAME_ATTRIBUTE = 'data-map-frame';
const DURATION_S = 0.5;

type FrameBox = {
  rect: DOMRect;
  radius: number;
};

let captured: FrameBox | undefined;

export const mapFrameProps = { [FRAME_ATTRIBUTE]: '' };

const boxOf = (element: Element): FrameBox => ({
  rect: element.getBoundingClientRect(),
  radius: parseFloat(getComputedStyle(element).borderTopLeftRadius) || 0,
});

export const captureMapFrame = () => {
  const frame = document.querySelector(`[${FRAME_ATTRIBUTE}]`);

  captured = frame ? boxOf(frame) : undefined;
};

const px = (value: number) => `${value}px`;

export const useMapFrame = (layoutKey: string) => {
  const frame = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const element = frame.current;
    const from = captured;

    captured = undefined;

    if (!element || !from || prefersReducedMotion()) return;

    const to = boxOf(element);

    Object.assign(element.style, {
      position: 'fixed',
      inset: 'auto',
      zIndex: '10',
      top: px(from.rect.top),
      left: px(from.rect.left),
      width: px(from.rect.width),
      height: px(from.rect.height),
      borderRadius: px(from.radius),
    });

    const controls = animate(
      element,
      {
        top: px(to.rect.top),
        left: px(to.rect.left),
        width: px(to.rect.width),
        height: px(to.rect.height),
        borderRadius: px(to.radius),
      },
      { duration: DURATION_S, ease: easeOutSoft },
    );

    const reset = () => element.removeAttribute('style');

    controls.then(reset);

    return () => {
      controls.stop();
      reset();
    };
  }, [layoutKey]);

  return frame;
};
