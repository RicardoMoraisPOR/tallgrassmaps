import type { LayerEntry } from './types';

export const createGifts = () => {
  const entries: Array<LayerEntry> = [];

  const add = (
    target: string,
    giver: string,
    dialog: Array<{ gift?: { name: string } }>,
  ) => {
    for (const { gift } of dialog)
      if (gift)
        entries.push({
          key: `gift:${target}:${gift.name}`,
          target,
          name: `${gift.name} (${giver})`,
          opens: true,
        });
  };

  return { entries, add };
};

export type Gifts = ReturnType<typeof createGifts>;
