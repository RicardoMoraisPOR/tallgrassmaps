import { MOBILE_QUERY } from '@/lib/breakpoints';
import { type MapLayout, useSettingsStore } from '@/stores/settings';

import { useMediaQuery } from './useMediaQuery';

export const useMapLayout = (versionGroup: string): MapLayout => {
  const mobile = useMediaQuery(MOBILE_QUERY);
  const saved = useSettingsStore((state) => state.layouts[versionGroup]);

  return saved ?? (mobile ? 'immersive' : 'minimalist');
};
