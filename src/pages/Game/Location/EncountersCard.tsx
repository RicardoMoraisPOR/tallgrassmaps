import type { Game } from '@/data/games';
import type {
  Encounter,
  EncounterMethod,
  PokedexEntry,
} from '@/data/pokedex/types';
import { pokemonSprite } from '@/data/sprites';

import { chanceLabel, levelLabel, methodLabel } from '../Pokedex/format';
import { ExpandableCard } from './ExpandableCard';

const CATCHABLE: Array<EncounterMethod> = [
  'walk',
  'surf',
  'old-rod',
  'good-rod',
  'super-rod',
  'static',
];

type Row = { entry: PokedexEntry; encounter: Encounter };

type EncountersCardProps = {
  game: Game;
  path: string;
  pokedex: Array<PokedexEntry>;
};

export const EncountersCard = ({
  game,
  path,
  pokedex,
}: EncountersCardProps) => {
  const groups = CATCHABLE.map((method) => ({
    method,
    rows: pokedex
      .flatMap((entry) =>
        entry.encounters
          .filter(
            (encounter) =>
              encounter.method === method &&
              encounter.path === path &&
              encounter.games.includes(game.id),
          )
          .map((encounter) => ({ entry, encounter })),
      )
      .sort(
        (a, b) =>
          (b.encounter.chance?.[1] ?? 0) - (a.encounter.chance?.[1] ?? 0),
      ),
  })).filter(({ rows }) => rows.length > 0);

  return (
    <ExpandableCard title="Pokémon encounters">
      {groups.length === 0 ? (
        <p className="text-[13px] text-muted-foreground">
          No Pokémon to catch here.
        </p>
      ) : (
        groups.map(({ method, rows }) => (
          <div key={method} className="flex flex-col gap-1">
            <h3 className="text-[13px] text-muted-foreground">
              {methodLabel({ method, path, games: [] })}
            </h3>
            <ul className="flex flex-col divide-y">
              {rows.map((row) => (
                <EncounterRow key={row.entry.number} row={row} />
              ))}
            </ul>
          </div>
        ))
      )}
    </ExpandableCard>
  );
};

const EncounterRow = ({ row }: { row: Row }) => {
  const { entry, encounter } = row;
  const chance = chanceLabel(encounter);

  return (
    <li className="flex items-center gap-3 py-1.5">
      <img
        src={pokemonSprite(entry.number)}
        alt=""
        width={96}
        height={96}
        loading="lazy"
        className="size-10 flex-none object-contain"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium">{entry.name}</span>
        <span className="text-xs text-muted-foreground">
          {levelLabel(encounter)}
        </span>
      </div>
      {chance && (
        <span
          title="Chance to appear here"
          className="text-sm font-medium tabular-nums"
        >
          {chance}
          <span className="sr-only"> chance to appear</span>
        </span>
      )}
    </li>
  );
};
