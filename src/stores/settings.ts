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
  layout: MapLayout | undefined;
  setAnimations: (animations: boolean) => void;
  setGamePointer: (gamePointer: boolean) => void;
  setThemePreset: (preset: ThemePreset) => void;
  setTheme: (area: ThemeArea, style: ThemeStyle) => void;
  setMapLayer: (layer: string, visible: boolean) => void;
  setLocationTab: (tab: LocationTab) => void;
  setLayout: (layout: MapLayout) => void;
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
      layout: undefined,
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
      setLayout: (layout) => set({ layout }),
    }),
    {
      name: 'tallgrass-settings',
      version: 3,
      storage: createJSONStorage(() => localStorage),
      migrate: (persisted, version) => {
        let state = persisted as {
          themes?: Partial<Record<string, ThemeStyle>>;
          layouts?: Partial<Record<string, MapLayout>>;
        };

        if (version < 2 && state.themes) {
          const { wildPokemon, mapIcons, ...themes } = state.themes;

          state = {
            ...state,
            themePreset: 'custom',
            themes: {
              ...themes,
              mapIcons,
              dialogBoxes: mapIcons,
              pokemonPopups: wildPokemon,
            },
          } as typeof state;
        }

        if (version < 3 && state.layouts) {
          const { layouts, ...rest } = state;
          const saved = Object.values(layouts);

          state = {
            ...rest,
            layout: saved.includes('immersive') ? 'immersive' : saved[0],
          } as typeof state;
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
        layout,
      }) => ({
        animations,
        gamePointer,
        themePreset,
        themes,
        mapLayers,
        locationTab,
        layout,
      }),
    },
  ),
);
