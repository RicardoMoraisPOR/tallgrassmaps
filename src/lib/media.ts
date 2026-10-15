import { useSettingsStore } from '@/stores/settings';

export const reducedMotionQuery = '(prefers-reduced-motion: reduce)';
export const touchQuery = '(hover: none), (pointer: coarse)';

export const matchesQuery = (query: string) => matchMedia(query).matches;

export const prefersReducedMotion = () =>
  !useSettingsStore.getState().animations || matchesQuery(reducedMotionQuery);

export const isTouchDevice = () => matchesQuery(touchQuery);
