import type { MapItem } from '@/data/items/types';
import type { MapNpc } from '@/data/npcs/types';

const HM_MOVES: Record<string, string> = {
  HM01: 'Cut',
  HM02: 'Fly',
  HM03: 'Surf',
  HM04: 'Strength',
  HM05: 'Flash',
};

export const giftItems = (
  npcs: Array<MapNpc>,
  mapItems: Array<MapItem>,
  gameId: string,
): Array<MapItem> => {
  const moveNames = new Map(
    mapItems.map(({ item }) => [item.split(' ')[0], item]),
  );

  return npcs
    .filter(({ games }) => games.includes(gameId))
    .flatMap(({ path, floor, x, y, dialog, games }) =>
      dialog.flatMap(({ gift, trigger }) => {
        if (!gift) return [];

        const code = gift.name;
        const move = HM_MOVES[code];

        return [
          {
            path,
            floor,
            x,
            y,
            item: move ? `${code} ${move}` : (moveNames.get(code) ?? code),
            hidden: false,
            sprite: gift.sprite,
            note: trigger,
            games,
          },
        ];
      }),
    );
};
