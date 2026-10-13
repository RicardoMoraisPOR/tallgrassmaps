import { MOBILE_QUERY } from '@/lib/breakpoints';
import { type MapLayout, useSettingsStore } from '@/stores/settings';

import { useMediaQuery } from './useMediaQuery';

export const useMapLayout = (): MapLayout => {
  const mobile = useMediaQuery(MOBILE_QUERY);
  const saved = useSettingsStore((state) => state.layout);

  return saved ?? (mobile ? 'immersive' : 'minimalist');
};
