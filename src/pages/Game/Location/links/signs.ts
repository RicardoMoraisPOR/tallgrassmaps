import type { MapSign } from '@/data/signs/types';

import { prizeHighlightKey } from '../encounters';
import { itemLayer, signLayer, staticLayer } from '../mapLayers';
import { entryKey } from './keys';
import { TILE_PIXELS } from './tiles';
import type { LayeredMapLink, LayerEntry, MarkerSources } from './types';

export const openableNames: Record<NonNullable<MapSign['opens']>, string> = {
  pokedex: 'Pokédex',
  'town-map': 'Town Map',
};

export const prizeEntries = (signs: Array<MapSign>): Array<LayerEntry> =>
  signs.flatMap(({ prizes = [] }) =>
    prizes.flatMap(({ item, coins }) =>
      item
        ? [
            {
              key: prizeHighlightKey(item),
              name: `${item} (${coins} coins)`,
              opens: true,
            },
          ]
        : [],
    ),
  );

export const signMarkers = (
  signs: Array<MapSign>,
  tileSize: number,
  { signTooltip, onOpen }: Pick<MarkerSources, 'signTooltip' | 'onOpen'>,
): Array<LayeredMapLink> =>
  signs.map((sign) => {
    if (sign.prizes) {
      const layer = sign.prizes.some(({ pokemon }) => pokemon)
        ? staticLayer()
        : itemLayer(false);

      return {
        x: sign.x * tileSize + tileSize / 2,
        y: sign.y * tileSize + tileSize / 2,
        width: 0,
        height: 0,
        label: 'Prize counter',
        layer: layer.id,
        className: layer.className,
        highlightKey: [
          `prize-counter:${sign.x},${sign.y}`,
          ...sign.prizes.map(({ pokemon, item }) =>
            prizeHighlightKey(pokemon?.number ?? item!),
          ),
        ],
        tooltip: signTooltip?.(sign),
        tooltipOnClick: true,
        icon: { kind: 'sign' as const },
        unlisted: true,
      };
    }

    if (sign.sprite) {
      const { opens } = sign;
      const layer = opens ? itemLayer(false) : signLayer();
      const label = opens ? openableNames[opens] : sign.text;

      const [spriteWidth, spriteHeight] = sign.spriteSize ?? [
        TILE_PIXELS,
        TILE_PIXELS,
      ];
      const [offsetX, offsetY] = sign.spriteOffset ?? [0, -TILE_PIXELS / 4];
      const scale = tileSize / TILE_PIXELS;

      return {
        x: sign.x * tileSize + offsetX * scale,
        y: sign.y * tileSize + offsetY * scale,
        width: spriteWidth * scale,
        height: spriteHeight * scale,
        label,
        layer: layer.id,
        className: layer.className,
        highlightKey: entryKey(layer.id, label),
        tooltip: signTooltip?.(sign),
        tooltipOnClick: !opens,
        onClick: opens && onOpen && (() => onOpen(opens)),
        sprite: {
          src: sign.sprite,
          facing: 'down' as const,
          ...(sign.spriteSize && { size: sign.spriteSize }),
        },
      };
    }

    const layer = signLayer();

    return {
      x: sign.x * tileSize + tileSize / 2,
      y: sign.y * tileSize + tileSize / 2,
      width: 0,
      height: 0,
      label: sign.text,
      layer: layer.id,
      className: layer.className,
      highlightKey: entryKey(layer.id, sign.text),
      tooltip: signTooltip?.(sign),
      tooltipOnClick: true,
      icon: { kind: 'sign' as const },
    };
  });
