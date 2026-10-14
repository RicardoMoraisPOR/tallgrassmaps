import { getLocation, type LocationKind, type Region } from '@/data/maps';

export type ZoneLayer = { id: string; label: string; count: number };

const ZONE_KINDS: Array<LocationKind> = ['wild-zone', 'sector'];

export const zoneLayerOf = (region: Region, target: string) => {
  const kind = getLocation(region, target)?.kind;

  return region.placeGroups?.groups.find(
    (candidate) => kind && candidate.kinds.includes(kind),
  )?.id;
};

export const zoneLayersOf = (
  region: Region,
  targets: Array<string>,
): Array<ZoneLayer> =>
  (region.placeGroups?.groups ?? [])
    .filter(({ kinds }) => kinds.some((kind) => ZONE_KINDS.includes(kind)))
    .map(({ id, label }) => ({
      id,
      label,
      count: targets.filter((target) => zoneLayerOf(region, target) === id)
        .length,
    }));
