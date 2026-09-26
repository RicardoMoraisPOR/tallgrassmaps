import type { Direction } from '@/data/maps';
import { useSettingsStore } from '@/stores/settings';

export const reducedMotionQuery = '(prefers-reduced-motion: reduce)';

export const prefersReducedMotion = () =>
  !useSettingsStore.getState().animations ||
  matchMedia(reducedMotionQuery).matches;

export const easeSineIn = 'cubic-bezier(0.12, 0, 0.39, 0)';
export const easeSineOut = 'cubic-bezier(0.61, 1, 0.88, 1)';

export const easeOutSoft = [0.2, 0.8, 0.2, 1] as const;

export type TravelState = { travel: Direction };

export const travelState = (travel?: Direction): TravelState | undefined =>
  travel ? { travel } : undefined;
