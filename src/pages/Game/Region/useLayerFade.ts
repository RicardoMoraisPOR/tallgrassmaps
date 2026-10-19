import { useEffect, useState } from 'react';

import type { MapLayerId } from '../Location/mapLayers';

const FADE_MS = 160;

const keyOf = (layers: Set<MapLayerId>) => [...layers].toSorted().join('|');

export const useLayerFade = (hidden: Set<MapLayerId>) => {
  const [applied, setApplied] = useState(hidden);
  const hiddenKey = keyOf(hidden);

  useEffect(() => {
    if (keyOf(applied) === hiddenKey) return;

    const timer = setTimeout(() => setApplied(new Set(hidden)), FADE_MS);

    return () => clearTimeout(timer);
  }, [hiddenKey]);

  return {
    hidden: new Set([...applied].filter((id) => hidden.has(id))),
    fading: [...hidden].filter((id) => !applied.has(id)),
  };
};
