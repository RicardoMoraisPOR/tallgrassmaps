import type { MapPalette } from '@/components/map/viewer/PaletteFilters';
import { gbcPaletteFor, hasGbcPalette } from '@/data/maps/gbcPalettes';
import { useSettingsStore } from '@/stores/settings';

type PaletteTarget = { path: string; floor?: string };

export const useMapPalette = (
  gameId: string,
  targetOf: (floorId?: string) => PaletteTarget,
): MapPalette | undefined => {
  const on = useSettingsStore((state) => state.mapColor);
  const setMapColor = useSettingsStore((state) => state.setMapColor);

  if (!hasGbcPalette(gameId)) return undefined;

  return {
    on,
    onToggle: () => setMapColor(!on),
    of: (floorId) => {
      const { path, floor } = targetOf(floorId);

      return gbcPaletteFor(gameId, path, floor);
    },
    objectsOf: (floorId) => {
      const { path, floor } = targetOf(floorId);

      return gbcPaletteFor(gameId, path, floor, true);
    },
  };
};
