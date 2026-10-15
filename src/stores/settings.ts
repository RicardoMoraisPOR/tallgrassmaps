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

export type LocationTab = 'info' | 'pokemon' | 'trainers';

type SettingsState = {
  animations: boolean;
  gamePointer: boolean;
  themePreset: ThemePreset;
  themes: Record<ThemeArea, ThemeStyle>;
  mapLayers: Partial<Record<string, boolean>>;
  locationTab: LocationTab;
  worldView: boolean;
  allFloors: boolean;
  setAnimations: (animations: boolean) => void;
  setGamePointer: (gamePointer: boolean) => void;
  setThemePreset: (preset: ThemePreset) => void;
  setTheme: (area: ThemeArea, style: ThemeStyle) => void;
  setMapLayer: (layer: string, visible: boolean) => void;
  setLocationTab: (tab: LocationTab) => void;
  setWorldView: (worldView: boolean) => void;
  setAllFloors: (allFloors: boolean) => void;
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
      worldView: false,
      allFloors: false,
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
      setWorldView: (worldView) => set({ worldView }),
      setAllFloors: (allFloors) => set({ allFloors }),
    }),
    {
      name: 'tallgrass-settings',
      version: 4,
      storage: createJSONStorage(() => localStorage),
      migrate: (persisted, version) => {
        let state = persisted as {
          themes?: Partial<Record<string, ThemeStyle>>;
          layout?: unknown;
          layouts?: unknown;
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

        delete state.layout;
        delete state.layouts;

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
        worldView,
        allFloors,
      }) => ({
        animations,
        gamePointer,
        themePreset,
        themes,
        mapLayers,
        locationTab,
        worldView,
        allFloors,
      }),
    },
  ),
);
