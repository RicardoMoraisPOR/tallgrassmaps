import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ThemeArea = 'pokedex' | 'townMap' | 'trainers' | 'sprites';

export type ThemeStyle = 'game' | 'tall-grass';

type SettingsState = {
  animations: boolean;
  gamePointer: boolean;
  themes: Record<ThemeArea, ThemeStyle>;
  mapLayers: Partial<Record<string, boolean>>;
  setAnimations: (animations: boolean) => void;
  setGamePointer: (gamePointer: boolean) => void;
  setTheme: (area: ThemeArea, style: ThemeStyle) => void;
  setMapLayer: (layer: string, visible: boolean) => void;
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
        sprites: 'tall-grass',
      },
      mapLayers: {},
      setAnimations: (animations) => set({ animations }),
      setGamePointer: (gamePointer) => set({ gamePointer }),
      setTheme: (area, style) =>
        set((state) => ({ themes: { ...state.themes, [area]: style } })),
      setMapLayer: (layer, visible) =>
        set((state) => ({
          mapLayers: { ...state.mapLayers, [layer]: visible },
        })),
    }),
    {
      name: 'tallgrass-settings',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ animations, gamePointer, themes, mapLayers }) => ({
        animations,
        gamePointer,
        themes,
        mapLayers,
      }),
    },
  ),
);
