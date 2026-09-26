import { useSyncExternalStore } from 'react';

export const useMediaQuery = (query: string) => {
  return useSyncExternalStore(
    (onChange) => {
      const list = matchMedia(query);

      list.addEventListener('change', onChange);

      return () => list.removeEventListener('change', onChange);
    },
    () => matchMedia(query).matches,
  );
};
