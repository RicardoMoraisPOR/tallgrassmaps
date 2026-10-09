import type { MapNpc } from '@/data/npcs/types';
import type { StaticPokemon } from '@/data/static-pokemon/types';

import { staticHighlightKey } from '../encounters';
import { staticLayer } from '../mapLayers';
import { entryKey } from './keys';
import { dotBox, spriteBox } from './tiles';
import type { LayeredMapLink, MarkerSources } from './types';

export const staticMarkers = (
  staticPokemon: Array<StaticPokemon>,
  npcs: Array<MapNpc>,
  tileSize: number,
  staticPopup: MarkerSources['staticPopup'],
): Array<LayeredMapLink> => {
  const npcTiles = new Set(npcs.map(({ x, y }) => `${x},${y}`));

  return staticPokemon
    .filter(
      (marker) => marker.sprite || !npcTiles.has(`${marker.x},${marker.y}`),
    )
    .map((marker) => {
      const layer = staticLayer();

      const label = marker.kind === 'gift' ? 'Gift Pokémon' : 'Static Pokémon';

      const common = {
        label,
        layer: layer.id,
        className: layer.className,
        highlightKey: [
          entryKey(layer.id, label),
          ...marker.pokemon.map(({ number }) => staticHighlightKey(number)),
        ],
        popup: staticPopup?.(marker),
      };

      if (marker.sprite) {
        return {
          ...common,
          ...spriteBox(marker.x, marker.y, tileSize),
          sprite: { src: marker.sprite, facing: marker.facing ?? 'down' },
        };
      }

      return { ...common, ...dotBox(marker.x, marker.y, tileSize) };
    });
};
