import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ThemeArea = 'pokedex' | 'townMap' | 'sprites';

export type ThemeStyle = 'game' | 'tall-grass';

type SettingsState = {
  animations: boolean;
  gamePointer: boolean;
  themes: Record<ThemeArea, ThemeStyle>;
  setAnimations: (animations: boolean) => void;
  setGamePointer: (gamePointer: boolean) => void;
  setTheme: (area: ThemeArea, style: ThemeStyle) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      animations: true,
      gamePointer: true,
      themes: { pokedex: 'game', townMap: 'game', sprites: 'tall-grass' },
      setAnimations: (animations) => set({ animations }),
      setGamePointer: (gamePointer) => set({ gamePointer }),
      setTheme: (area, style) =>
        set((state) => ({ themes: { ...state.themes, [area]: style } })),
    }),
    {
      name: 'tallgrass-settings',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ animations, gamePointer, themes }) => ({
        animations,
        gamePointer,
        themes,
      }),
    },
  ),
);
