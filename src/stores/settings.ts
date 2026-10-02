import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ThemeArea =
  | 'pokedex'
  | 'townMap'
  | 'mapIcons'
  | 'dialogBoxes'
  | 'trainers'
  | 'pokemonPopups'
  | 'hallOfFame'
  | 'sprites';

export type ThemeStyle = 'game' | 'tall-grass';

export type ThemePreset = ThemeStyle | 'custom';

export type LocationTab = 'info' | 'pokemon' | 'trainers';

type SettingsState = {
  animations: boolean;
  gamePointer: boolean;
  themePreset: ThemePreset;
  themes: Record<ThemeArea, ThemeStyle>;
  mapLayers: Partial<Record<string, boolean>>;
  locationTab: LocationTab;
  setAnimations: (animations: boolean) => void;
  setGamePointer: (gamePointer: boolean) => void;
  setThemePreset: (preset: ThemePreset) => void;
  setTheme: (area: ThemeArea, style: ThemeStyle) => void;
  setMapLayer: (layer: string, visible: boolean) => void;
  setLocationTab: (tab: LocationTab) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      animations: true,
      gamePointer: true,
      themePreset: 'game',
      themes: {
        pokedex: 'game',
        townMap: 'game',
        mapIcons: 'game',
        dialogBoxes: 'game',
        trainers: 'game',
        pokemonPopups: 'game',
        hallOfFame: 'tall-grass',
        sprites: 'tall-grass',
      },
      mapLayers: {},
      locationTab: 'info',
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
              Object.entries(state?.themes ?? {}).filter(([, style]) => style),
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
      }) => ({
        animations,
        gamePointer,
        themePreset,
        themes,
        mapLayers,
        locationTab,
      }),
    },
  ),
);
