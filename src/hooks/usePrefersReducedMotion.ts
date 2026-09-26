import { useSyncExternalStore } from 'react';

import { reducedMotionQuery } from '@/lib/motion';

export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const query = matchMedia(reducedMotionQuery);
      query.addEventListener('change', onChange);
      return () => query.removeEventListener('change', onChange);
    },
    () => matchMedia(reducedMotionQuery).matches,
  );
}
