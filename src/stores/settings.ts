import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ThemeArea =
  | 'pokedex'
  | 'mapIcons'
  | 'dialogBoxes'
  | 'trainers'
  | 'pokemonPopups'
  | 'sprites';

export type ThemeStyle = 'game' | 'tall-grass';

export type ThemePreset = ThemeStyle | 'custom';

export type MapLayout = 'minimalist' | 'immersive';

export type LocationTab = 'info' | 'pokemon' | 'trainers';

type SettingsState = {
  animations: boolean;
  gamePointer: boolean;
  themePreset: ThemePreset;
  themes: Record<ThemeArea, ThemeStyle>;
  mapLayers: Partial<Record<string, boolean>>;
  locationTab: LocationTab;
  layouts: Partial<Record<string, MapLayout>>;
  setAnimations: (animations: boolean) => void;
  setGamePointer: (gamePointer: boolean) => void;
  setThemePreset: (preset: ThemePreset) => void;
  setTheme: (area: ThemeArea, style: ThemeStyle) => void;
  setMapLayer: (layer: string, visible: boolean) => void;
  setLocationTab: (tab: LocationTab) => void;
  setLayout: (versionGroup: string, layout: MapLayout) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      animations: true,
      gamePointer: true,
      themePreset: 'game',
      themes: {
        pokedex: 'game',
        mapIcons: 'game',
        dialogBoxes: 'game',
        trainers: 'game',
        pokemonPopups: 'game',
        sprites: 'tall-grass',
      },
      mapLayers: {},
      locationTab: 'info',
      layouts: {},
      setAnimations: (animations) => set({ animations }),
      setGamePointer: (gamePointer) => set({ gamePointer }),
      setThemePreset: (themePreset) => set({ themePreset }),
      setTheme: (area, style) =>
        set((state) => ({ themes: { ...state.themes, [area]: style } })),
      setMapLayer: (layer, visible) =>
        set((state) => ({
          mapLayers: { ...state.mapLayers, [layer]: visible },
        })),
      setLocationTab: (locationTab) => set({ locationTab }),
      setLayout: (versionGroup, layout) =>
        set((state) => ({
          layouts: { ...state.layouts, [versionGroup]: layout },
        })),
    }),
    {
      name: 'tallgrass-settings',
      version: 2,
      storage: createJSONStorage(() => localStorage),
      migrate: (persisted, version) => {
        const state = persisted as {
          themes?: Partial<Record<string, ThemeStyle>>;
        };

        if (version < 2 && state.themes) {
          const { wildPokemon, mapIcons, ...themes } = state.themes;

          return {
            ...state,
            themePreset: 'custom',
            themes: {
              ...themes,
              mapIcons,
              dialogBoxes: mapIcons,
              pokemonPopups: wildPokemon,
            },
          };
        }

        return state;
      },
      merge: (persisted, current) => {
        const state = persisted as Partial<SettingsState> | undefined;

        return {
          ...current,
          ...state,
          themes: {
            ...current.themes,
            ...Object.fromEntries(
              Object.entries(state?.themes ?? {}).filter(
                ([area, style]) => style && area in current.themes,
              ),
            ),
          },
        };
      },
      partialize: ({
        animations,
        gamePointer,
        themePreset,
        themes,
        mapLayers,
        locationTab,
        layouts,
      }) => ({
        animations,
        gamePointer,
        themePreset,
        themes,
        mapLayers,
        locationTab,
        layouts,
      }),
    },
  ),
);
