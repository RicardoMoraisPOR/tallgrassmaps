import type { MapItem } from '@/data/items/types';

import { itemLayer } from '../mapLayers';
import { entryKey } from './keys';
import { dotBox, spriteBox } from './tiles';
import type { LayeredMapLink, MarkerSources } from './types';

export const itemMarkers = (
  items: Array<MapItem>,
  tileSize: number,
  itemTooltip: MarkerSources['itemTooltip'],
): Array<LayeredMapLink> =>
  items.map((item) => {
    const layer = itemLayer(item.hidden);

    const label = item.hidden ? `${item.item} (hidden)` : item.item;

    const common = {
      label,
      layer: layer.id,
      className: layer.className,
      highlightKey: entryKey(layer.id, label),
      tooltip: itemTooltip?.(item),
    };

    if (item.sprite) {
      return {
        ...common,
        ...spriteBox(item.x, item.y, tileSize),
        sprite: {
          src: item.sprite,
          facing: 'down' as const,
          faded: item.hidden,
        },
      };
    }

    return { ...common, ...dotBox(item.x, item.y, tileSize) };
  });
