import type { MapMarker } from '@/data/maps';
import type { Shop } from '@/data/shops/types';

import { markerLayer } from '../mapLayers';
import type { LayeredMapLink, MarkerSources } from './types';

type ShopSources = Pick<MarkerSources, 'onOpenShop'>;

export const registerMarkers = (
  shops: Array<Shop>,
  allShops: Array<Shop>,
  tileSize: number,
  { onOpenShop }: ShopSources,
): Array<LayeredMapLink> =>
  shops.map((shop) => {
    const layer = markerLayer('mart');
    const building = allShops.filter(({ path }) => path === shop.path);

    return {
      x: shop.x * tileSize + tileSize / 2,
      y: shop.y * tileSize + tileSize / 2,
      width: 0,
      height: 0,
      label: `${shop.name} stock`,
      layer: layer.id,
      className: layer.className,
      onClick: () => onOpenShop?.(building, shop.id),
      icon: { kind: 'register' as const },
      unlisted: true,
    };
  });

export const entranceRegisters = (
  markers: Array<MapMarker & { target?: string }>,
  shops: Array<Shop>,
  tileSize: number,
  { onOpenShop }: ShopSources,
): Array<LayeredMapLink> =>
  markers.flatMap(({ x, y, width, height, target, name }) => {
    const building = shops.filter(({ path }) => path === target);

    if (building.length === 0) return [];

    const layer = markerLayer('mart');

    return [
      {
        x: x + width / 2,
        y: y + height / 2 - tileSize,
        width: 0,
        height: 0,
        label: `${name} stock`,
        layer: layer.id,
        className: layer.className,
        onClick: () => onOpenShop?.(building, building[0].id),
        icon: { kind: 'register' as const },
        unlisted: true,
      },
    ];
  });
