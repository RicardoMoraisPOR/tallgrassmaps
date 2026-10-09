import type { Location } from '@/data/maps';

import { markerLayer } from '../mapLayers';
import { withQuery } from './arrivals';
import type { buildConnections } from './connections';
import type { LayeredMapLink } from './types';

type Pairing = ReturnType<typeof buildConnections>['pairing'];

export const markerLinks = (
  location: Location,
  href: (path: string) => string,
  pairing: Pairing,
  hotspotCount: number,
): Array<LayeredMapLink> => {
  const markerTargets = location.markers.filter(({ target }) => target);

  return location.markers.map((marker) => {
    const { kind, name, target, ...area } = marker;
    const layer = markerLayer(kind);
    const { arrival, via } = target
      ? pairing({ target }, hotspotCount + markerTargets.indexOf(marker))
      : {};

    return {
      ...area,
      href: target && withQuery(href(target), { via }),
      ...(target && arrival && { highlightKey: [href(target), arrival] }),
      label: name,
      layer: layer.id,
      className: layer.className,
    };
  });
};

export const buildingIcons = (
  links: Array<LayeredMapLink>,
  markers: Array<LayeredMapLink>,
): Array<LayeredMapLink> =>
  [...links.filter((link) => link.layer === 'buildings'), ...markers].map(
    (link) => ({
      ...link,
      x: link.x + link.width / 2,
      y: link.y + link.height / 2,
      width: 0,
      height: 0,
      icon: { kind: 'door' as const },
    }),
  );
