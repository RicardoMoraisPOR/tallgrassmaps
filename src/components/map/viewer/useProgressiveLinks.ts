import { useEffect, useState } from 'react';

import { linkKey } from './links';
import type { MapLink } from './types';

const LINKS_PER_FRAME = 20;

export const useProgressiveLinks = (
  links: Array<MapLink>,
  paused = false,
  priorityFloorId?: string,
) => {
  const [admitted, setAdmitted] = useState(() => new Set<string>());
  const pending = links.filter((link) => !admitted.has(linkKey(link)));

  useEffect(() => {
    const current = new Set(links.map(linkKey));
    const kept = [...admitted].filter((key) => current.has(key));

    const queued = paused ? [] : pending;
    const urgent =
      priorityFloorId === undefined
        ? []
        : queued.filter((link) => link.floorId === priorityFloorId);
    const waiting =
      urgent.length > 0
        ? [
            ...urgent,
            ...queued
              .filter((link) => link.floorId !== priorityFloorId)
              .slice(0, LINKS_PER_FRAME),
          ]
        : queued.slice(0, LINKS_PER_FRAME);

    if (waiting.length === 0 && kept.length === admitted.size) return;

    const frame = requestAnimationFrame(() =>
      setAdmitted(new Set([...kept, ...waiting.map(linkKey)])),
    );

    return () => cancelAnimationFrame(frame);
  });

  return links.filter((link) => admitted.has(linkKey(link)));
};
