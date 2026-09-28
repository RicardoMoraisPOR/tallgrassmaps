import type { Game } from '@/data/games';
import type { TrainerBattle } from '@/data/trainers/types';

export type ListedBattle = {
  battle: TrainerBattle;
  key: string;
  label: string;
  number?: number;
};

export type BattleGroup = {
  area?: string;
  battles: Array<ListedBattle>;
};

type BattleFilter = {
  game: Game;
  path: string;
  floor?: string;
  onMapOnly: boolean;
};

const numbered = (battles: Array<TrainerBattle>): Array<ListedBattle> => {
  const totals = new Map<string, number>();
  const seen = new Map<string, number>();

  for (const { name } of battles) totals.set(name, (totals.get(name) ?? 0) + 1);

  return battles.map((battle) => {
    const count = (seen.get(battle.name) ?? 0) + 1;
    const number = (totals.get(battle.name) ?? 0) > 1 ? count : undefined;

    const label = number ? `${battle.name} #${number}` : battle.name;

    seen.set(battle.name, count);

    return {
      battle,
      key: `trainer:${battle.path}:${battle.floor ?? ''}:${battle.area ?? ''}:${label}`,
      label,
      number,
    };
  });
};

export const battleGroups = (
  trainers: Array<TrainerBattle>,
  { game, path, floor, onMapOnly }: BattleFilter,
): Array<BattleGroup> => {
  const battles = trainers.filter(
    (battle) =>
      battle.path === path &&
      battle.games.includes(game.id) &&
      (!floor || battle.floor === floor) &&
      !(onMapOnly && battle.area),
  );

  if (floor) return [{ battles: numbered(battles) }];

  return [...new Set(battles.map((battle) => battle.area))].map((area) => ({
    area,
    battles: numbered(battles.filter((battle) => battle.area === area)),
  }));
};
