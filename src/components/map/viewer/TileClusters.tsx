import { useMemo } from 'react';

import { divIcon } from 'leaflet';
import { Marker, useMap } from 'react-leaflet';

import { toLatLng } from '../coordinates';

export type TileCluster = {
  tileId: string;
  x: number;
  y: number;
  compact?: boolean;
  counts: Array<{ label: string; color: string; count: number }>;
};

export const TileClusters = ({
  cluster,
  zoomTo,
  onSelect,
}: {
  cluster: TileCluster;
  zoomTo: number;
  onSelect: (tileId: string) => void;
}) => {
  const leafletMap = useMap();
  const { tileId, x, y, counts, compact } = cluster;
  const summary = counts
    .map(({ count, label }) => `${count} ${label.toLowerCase()}`)
    .join(', ');
  const icon = useMemo(
    () =>
      divIcon({
        className: 'map-cluster-anchor',
        html: `<span class="map-cluster-row${compact ? ' map-cluster-compact' : ''}">${counts
          .map(
            ({ color, count }) =>
              `<span class="map-cluster" style="--layer:${color}">${count}</span>`,
          )
          .join('')}</span>`,
        iconSize: [0, 0],
      }),
    [counts, compact],
  );

  return (
    <Marker
      position={toLatLng(x, y)}
      icon={icon}
      title={summary}
      eventHandlers={{
        click: () => {
          onSelect(tileId);
          leafletMap.flyTo(
            toLatLng(x, y),
            Math.max(leafletMap.getZoom() + 1, zoomTo),
          );
        },
      }}
    />
  );
};
