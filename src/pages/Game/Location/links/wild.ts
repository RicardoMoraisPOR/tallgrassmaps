import type { WildArea } from '@/data/maps';
import { cn } from '@/lib/utils';

import { wildHighlightKey } from '../encounters';
import { wildBadgeLayer, wildLayer } from '../mapLayers';
import type { LayeredMapLink, MarkerSources } from './types';

export const wildMarkers = (
  wildAreas: Array<WildArea>,
  image: { width: number; height: number },
  tileSize: number,
  wildPopup: MarkerSources['wildPopup'],
  wildCount: MarkerSources['wildCount'],
): Array<LayeredMapLink> =>
  wildAreas.flatMap(({ method, whole, outline = [], note }) => {
    const layer = wildLayer();
    const badgeLayer = wildBadgeLayer();
    const scaled = outline.map((ring) =>
      ring.map(([x, y]): [number, number] => [x * tileSize, y * tileSize]),
    );
    const xs = scaled.flat().map(([x]) => x);
    const ys = scaled.flat().map(([, y]) => y);
    const bounds =
      scaled.length === 0
        ? { x: 0, y: 0, width: image.width, height: image.height }
        : {
            x: Math.min(...xs),
            y: Math.min(...ys),
            width: Math.max(...xs) - Math.min(...xs),
            height: Math.max(...ys) - Math.min(...ys),
          };

    const count = wildCount?.(method) ?? 0;
    const area: LayeredMapLink = {
      ...bounds,
      ...(scaled.length > 0 && { outline: scaled }),
      label: method === 'water' ? 'Wild Pokémon (water)' : 'Wild Pokémon',
      layer: layer.id,
      className: cn(
        layer.className,
        whole && 'map-link-wild-whole',
        method === 'water' && 'map-link-wild-water',
      ),
      highlightKey: wildHighlightKey(method),
      tooltip: wildPopup?.(method, note),
      tooltipOnClick: true,
      tooltipAtClick: true,
      behind: true,
    };

    return count > 0
      ? [
          area,
          {
            ...bounds,
            ...(scaled.length > 0 && { outline: scaled }),
            label: 'Wild Pokémon count',
            layer: badgeLayer.id,
            className: badgeLayer.className,
            badge: count,
            area,
          },
        ]
      : [area];
  });
