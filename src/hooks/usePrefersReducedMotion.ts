import { reducedMotionQuery } from '@/lib/motion';

import { useMediaQuery } from './useMediaQuery';

export const usePrefersReducedMotion = () => useMediaQuery(reducedMotionQuery);
