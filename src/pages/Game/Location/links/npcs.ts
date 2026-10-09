import type { MapNpc } from '@/data/npcs/types';

import { staticHighlightKey, tradeHighlightKey } from '../encounters';
import { itemLayer, npcLayer } from '../mapLayers';
import type { Gifts } from './gifts';
import { entryKey } from './keys';
import { TILE_PIXELS } from './tiles';
import type { LayeredMapLink, MarkerSources } from './types';

const DEFAULT_SPRITE_OFFSET = [0, -4];

export const npcMarkers = (
  npcs: Array<MapNpc>,
  tileSize: number,
  gifts: Gifts,
  npcTooltip: MarkerSources['npcTooltip'],
): Array<LayeredMapLink> => {
  const npcTotals = new Map<string, number>();
  const npcSeen = new Map<string, number>();

  for (const { name } of npcs)
    npcTotals.set(name, (npcTotals.get(name) ?? 0) + 1);

  return npcs.map((npc) => {
    const layer = npc.item ? itemLayer(false) : npcLayer(npc.special);
    const count = (npcSeen.get(npc.name) ?? 0) + 1;
    const label =
      (npcTotals.get(npc.name) ?? 0) > 1 ? `${npc.name} #${count}` : npc.name;

    npcSeen.set(npc.name, count);
    gifts.add(entryKey(layer.id, label), label, npc.dialog);
    const [offsetX, offsetY] = npc.spriteOffset ?? DEFAULT_SPRITE_OFFSET;

    return {
      x: (npc.x + offsetX / TILE_PIXELS) * tileSize,
      y: (npc.y + offsetY / TILE_PIXELS) * tileSize,
      width: tileSize,
      height: tileSize,
      label,
      layer: layer.id,
      className: layer.className,
      highlightKey: [
        entryKey(layer.id, label),
        ...npc.dialog.flatMap(({ trade }) =>
          trade ? [tradeHighlightKey(trade.receive.number)] : [],
        ),
        ...npc.dialog.flatMap(({ pokemon }) =>
          pokemon ? [staticHighlightKey(pokemon.number)] : [],
        ),
      ],
      tooltip: npcTooltip?.(npc),
      tooltipOnClick: true,
      sprite: { src: npc.sprite, facing: npc.facing },
    };
  });
};
