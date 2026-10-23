import { useEffect, useMemo, useState } from 'react';

import type { MapLayerId } from '../Location/mapLayers';

const FADE_MS = 160;

const keyOf = (layers: Set<MapLayerId>) => [...layers].toSorted().join('|');

export const useLayerFade = (hidden: Set<MapLayerId>) => {
  const [applied, setApplied] = useState(hidden);

  useEffect(() => {
    if (keyOf(applied) === keyOf(hidden)) return undefined;

    const timer = setTimeout(() => setApplied(hidden), FADE_MS);

    return () => clearTimeout(timer);
  }, [applied, hidden]);

  return useMemo(
    () => ({
      hidden: new Set([...applied].filter((id) => hidden.has(id))),
      fading: [...hidden].filter((id) => !applied.has(id)),
    }),
    [applied, hidden],
  );
};
