import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ThemeArea =
  | 'pokedex'
  | 'townMap'
  | 'trainers'
  | 'wildPokemon'
  | 'mapIcons'
  | 'sprites';

export type ThemeStyle = 'game' | 'tall-grass';

export type LocationTab = 'info' | 'pokemon' | 'trainers';

type SettingsState = {
  animations: boolean;
  gamePointer: boolean;
  themes: Record<ThemeArea, ThemeStyle>;
  mapLayers: Partial<Record<string, boolean>>;
  locationTab: LocationTab;
  setAnimations: (animations: boolean) => void;
  setGamePointer: (gamePointer: boolean) => void;
  setTheme: (area: ThemeArea, style: ThemeStyle) => void;
  setMapLayer: (layer: string, visible: boolean) => void;
  setLocationTab: (tab: LocationTab) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      animations: true,
      gamePointer: true,
      themes: {
        pokedex: 'game',
        townMap: 'game',
        trainers: 'game',
        wildPokemon: 'game',
        mapIcons: 'game',
        sprites: 'tall-grass',
      },
      mapLayers: {},
      locationTab: 'info',
      setAnimations: (animations) => set({ animations }),
      setGamePointer: (gamePointer) => set({ gamePointer }),
      setTheme: (area, style) =>
        set((state) => ({ themes: { ...state.themes, [area]: style } })),
      setMapLayer: (layer, visible) =>
        set((state) => ({
          mapLayers: { ...state.mapLayers, [layer]: visible },
        })),
      setLocationTab: (locationTab) => set({ locationTab }),
    }),
    {
      name: 'tallgrass-settings',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: ({
        animations,
        gamePointer,
        themes,
        mapLayers,
        locationTab,
      }) => ({
        animations,
        gamePointer,
        themes,
        mapLayers,
        locationTab,
      }),
    },
  ),
);
