import { trainerLayer } from '../mapLayers';
import type { ListedBattle } from '../trainerList';
import type { Gifts } from './gifts';
import { dotBox, spriteBox } from './tiles';
import type { LayeredMapLink, MarkerSources } from './types';

export const trainerMarkers = (
  trainers: Array<ListedBattle>,
  tileSize: number,
  gifts: Gifts,
  {
    onSelectTrainer,
    trainerTooltip,
  }: Pick<MarkerSources, 'onSelectTrainer' | 'trainerTooltip'>,
): Array<LayeredMapLink> => {
  const trainersByTile = new Map<string, Array<ListedBattle>>();

  for (const listed of trainers) {
    const { x, y } = listed.battle;

    if (x === undefined || y === undefined) continue;

    const tile = `${x},${y}`;

    trainersByTile.set(tile, [...(trainersByTile.get(tile) ?? []), listed]);
  }

  return [...trainersByTile.values()].flatMap((group) => {
    const [{ battle, key, label }] = group;
    const x = battle.x ?? 0;
    const y = battle.y ?? 0;

    const layer = trainerLayer();

    if (trainerTooltip)
      for (const listed of group)
        gifts.add(listed.key, listed.label, listed.battle.dialog ?? []);

    const common = {
      label,
      layer: layer.id,
      className: layer.className,
      highlightKey: group.map((listed) => listed.key),
      onClick: onSelectTrainer && (() => onSelectTrainer(key)),
      tooltip: trainerTooltip?.(group),
    };

    if (battle.sprite) {
      return [
        {
          ...common,
          ...spriteBox(x, y, tileSize),
          sprite: { src: battle.sprite, facing: battle.facing ?? 'down' },
        },
        ...(battle.partner
          ? [
              {
                ...common,
                ...spriteBox(battle.partner.x, battle.partner.y, tileSize),
                sprite: {
                  src: battle.partner.sprite,
                  facing: battle.partner.facing,
                },
              },
            ]
          : []),
      ];
    }

    return [{ ...common, ...dotBox(x, y, tileSize) }];
  });
};
