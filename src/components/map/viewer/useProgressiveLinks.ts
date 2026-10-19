import { useEffect, useState } from 'react';

import { linkKey } from './links';
import type { MapLink } from './types';

const LINKS_PER_FRAME = 20;

export const useProgressiveLinks = (links: Array<MapLink>) => {
  const [admitted, setAdmitted] = useState(() => new Set<string>());
  const pending = links.filter((link) => !admitted.has(linkKey(link)));

  useEffect(() => {
    const current = new Set(links.map(linkKey));
    const kept = [...admitted].filter((key) => current.has(key));

    if (pending.length === 0 && kept.length === admitted.size) return;

    const frame = requestAnimationFrame(() =>
      setAdmitted(
        new Set([...kept, ...pending.slice(0, LINKS_PER_FRAME).map(linkKey)]),
      ),
    );

    return () => cancelAnimationFrame(frame);
  });

  return links.filter((link) => admitted.has(linkKey(link)));
};
