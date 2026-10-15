import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const MAX_RECENT = 4;

type RecentPlacesState = {
  places: Record<string, Array<string>>;
  visit: (gameId: string, path: string) => void;
};

export const useRecentPlacesStore = create<RecentPlacesState>()(
  persist(
    (set) => ({
      places: {},
      visit: (gameId, path) =>
        set((state) => {
          const current = state.places[gameId] ?? [];

          if (current[0] === path) return state;

          return {
            places: {
              ...state.places,
              [gameId]: [
                path,
                ...current.filter((entry) => entry !== path),
              ].slice(0, MAX_RECENT),
            },
          };
        }),
    }),
    {
      name: 'tallgrass-recent-places',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
