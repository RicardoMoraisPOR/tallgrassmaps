import { reducedMotionQuery } from '@/lib/motion';
import { useSettingsStore } from '@/stores/settings';

import { useMediaQuery } from './useMediaQuery';

export const usePrefersReducedMotion = () => {
  const systemPrefers = useMediaQuery(reducedMotionQuery);
  const animations = useSettingsStore((state) => state.animations);

  return systemPrefers || !animations;
};
