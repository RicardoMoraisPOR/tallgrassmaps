import type { MapLink } from '@/components/map/MapViewer';
import { getLocation, type Location, type Region } from '@/data/maps';
import { joinPath } from '@/lib/paths';

import type { PlaceLink } from './PlaceCard';

export const locationLinks = (
  region: Region,
  location: Location,
  path: string,
  href: (path: string) => string,
) => {
  const links: MapLink[] = location.hotspots.flatMap((hotspot) => {
    const target = getLocation(region, hotspot.target);
    return target
      ? [{ ...hotspot, href: href(hotspot.target), label: target.name }]
      : [];
  });

  const inside: PlaceLink[] = location.locations.map((child) => ({
    href: href(joinPath(path, child.id)),
    name: child.name,
  }));
  const insideHrefs = new Set(inside.map((link) => link.href));

  const connections = new Map<string, PlaceLink>();
  for (const link of links) {
    if (!insideHrefs.has(link.href)) {
      connections.set(link.href, {
        href: link.href,
        name: link.label,
        travel: link.travel,
      });
    }
  }

  return { links, inside, connections: [...connections.values()] };
};
