import type { WildArea } from '@/data/maps';
import { cn } from '@/lib/utils';

import { wildHighlightKey } from '../encounters';
import { wildLayer } from '../mapLayers';
import type { LayeredMapLink, MarkerSources } from './types';

export const wildMarkers = (
  wildAreas: Array<WildArea>,
  image: { width: number; height: number },
  tileSize: number,
  wildPopup: MarkerSources['wildPopup'],
): Array<LayeredMapLink> =>
  wildAreas.map(({ method, whole, outline = [], note }) => {
    const layer = wildLayer();
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

    return {
      ...bounds,
      ...(scaled.length > 0 && { outline: scaled }),
      label: method === 'water' ? 'Wild Pokémon (water)' : 'Wild Pokémon',
      layer: layer.id,
      className: cn(layer.className, whole && 'map-link-wild-whole'),
      highlightKey: wildHighlightKey(method),
      tooltip: wildPopup?.(method, note),
      tooltipOnClick: true,
      tooltipAtClick: true,
      behind: true,
    };
  });
