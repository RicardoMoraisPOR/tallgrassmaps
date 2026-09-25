import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// Collected entries are keyed by id and store the time they were collected.
type Collection = Record<string, number>;

type TrackerState = {
  items: Collection;
  secrets: Collection;
  toggleItem: (id: string) => void;
  toggleSecret: (id: string) => void;
  reset: () => void;
};

const toggle = (collection: Collection, id: string): Collection => {
  const next = { ...collection };
  if (id in next) {
    delete next[id];
  } else {
    next[id] = Date.now();
  }
  return next;
};

export const useTrackerStore = create<TrackerState>()(
  persist(
    (set) => ({
      items: {},
      secrets: {},
      toggleItem: (id) => set((state) => ({ items: toggle(state.items, id) })),
      toggleSecret: (id) =>
        set((state) => ({ secrets: toggle(state.secrets, id) })),
      reset: () => set({ items: {}, secrets: {} }),
    }),
    {
      name: 'tallgrass-tracker',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ items, secrets }) => ({ items, secrets }),
    },
  ),
);
