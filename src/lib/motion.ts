import type { Direction } from '@/data/maps';

export const reducedMotionQuery = '(prefers-reduced-motion: reduce)';

export const prefersReducedMotion = () =>
  matchMedia(reducedMotionQuery).matches;

export const easeSineIn = 'cubic-bezier(0.12, 0, 0.39, 0)';
export const easeSineOut = 'cubic-bezier(0.61, 1, 0.88, 1)';

export type TravelState = { travel: Direction };

export const travelState = (travel?: Direction): TravelState | undefined =>
  travel ? { travel } : undefined;
