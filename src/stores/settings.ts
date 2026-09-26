import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ThemeArea = 'pokedex' | 'townMap' | 'sprites';

export type ThemeStyle = 'game' | 'tall-grass';

type SettingsState = {
  animations: boolean;
  gamePointer: boolean;
  useGameThemes: boolean;
  themes: Record<ThemeArea, ThemeStyle>;
  setAnimations: (animations: boolean) => void;
  setGamePointer: (gamePointer: boolean) => void;
  setUseGameThemes: (useGameThemes: boolean) => void;
  setTheme: (area: ThemeArea, style: ThemeStyle) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      animations: true,
      gamePointer: true,
      useGameThemes: false,
      themes: { pokedex: 'tall-grass', townMap: 'game', sprites: 'tall-grass' },
      setAnimations: (animations) => set({ animations }),
      setGamePointer: (gamePointer) => set({ gamePointer }),
      setUseGameThemes: (useGameThemes) => set({ useGameThemes }),
      setTheme: (area, style) =>
        set((state) => ({ themes: { ...state.themes, [area]: style } })),
    }),
    {
      name: 'tallgrass-settings',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ animations, gamePointer, useGameThemes, themes }) => ({
        animations,
        gamePointer,
        useGameThemes,
        themes,
      }),
    },
  ),
);
