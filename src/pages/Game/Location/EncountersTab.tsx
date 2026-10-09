import { BookOpen } from 'lucide-react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import type { Game } from '@/data/games';
import type { Encounter } from '@/data/pokedex/types';
import { type PokemonSprite, usePokemonSprite } from '@/hooks/usePokemonSprite';
import { cn } from '@/lib/utils';

import {
  alphaLabel,
  chanceLabel,
  levelLabel,
  methodLabel,
} from '../Pokedex/format';
import { PokemonTypeTags } from '../Pokedex/PokemonTypeTags';
import { usePokedexLink } from '../Pokedex/usePokedex';
import {
  type EncounterGroup,
  encounterHighlightKey,
  type EncounterRowData,
} from './encounters';
import { PokedexEntryLink } from './PokedexEntryLink';

type EncountersTabProps = {
  game: Game;
  path: string;
  groups: Array<EncounterGroup>;
  onHighlight: (key: string | undefined) => void;
};

export const EncountersTab = ({
  game,
  path,
  groups,
  onHighlight,
}: EncountersTabProps) => {
  return (
    <>
      {groups.map(({ method, rows }) => (
        <div key={method} className="flex flex-col gap-1">
          <h3 className="text-[13px] text-muted-foreground">
            {methodLabel({ method, path, games: [] })}
          </h3>
          <EncounterList
            game={game}
            rows={rows}
            linked
            highlightKeyFor={encounterHighlightKey}
            onHighlight={onHighlight}
          />
        </div>
      ))}
    </>
  );
};

type EncounterListProps = {
  game: Game;
  rows: Array<EncounterRowData>;
  compact?: boolean;
  linked?: boolean;
  highlightKeyFor?: (row: EncounterRowData) => string | undefined;
  onHighlight?: (key: string | undefined) => void;
};

type EncounterRowProps = Omit<EncounterListProps, 'game' | 'rows'> & {
  row: EncounterRowData;
  encounters: Array<Encounter>;
  sprite: PokemonSprite;
};

export const OpenPokedexButton = () => {
  const pokedexLink = usePokedexLink();

  return (
    <Button variant="outline" className="w-full" asChild>
      <Link {...pokedexLink}>
        <BookOpen aria-hidden />
        Open Pokédex
      </Link>
    </Button>
  );
};

export const EncounterList = ({
  game,
  rows,
  ...options
}: EncounterListProps) => {
  const spriteFor = usePokemonSprite(game);

  return (
    <ul
      className={cn(
        'flex flex-col',
        options.compact ? 'divide-y divide-border/60' : 'gap-2',
      )}
    >
      {groupBySpecies(rows).map(({ row, encounters }) => {
        const Row = options.compact ? EncounterRow : EncounterCard;

        return (
          <Row
            key={row.entry.number}
            row={row}
            encounters={encounters}
            sprite={spriteFor(row.entry.number)}
            {...options}
          />
        );
      })}
    </ul>
  );
};

const groupBySpecies = (rows: Array<EncounterRowData>) =>
  rows.reduce<Array<{ row: EncounterRowData; encounters: Array<Encounter> }>>(
    (groups, row) => {
      const group = groups.find(
        ({ row: first }) => first.entry.number === row.entry.number,
      );

      if (group) group.encounters.push(row.encounter);
      else groups.push({ row, encounters: [row.encounter] });

      return groups;
    },
    [],
  );

const levelRange = (encounters: Array<Encounter>) => {
  const own = encounters.flatMap(({ levels }) => (levels ? [levels] : []));
  const ranges =
    own.length > 0
      ? own
      : encounters.flatMap(({ alpha }) =>
          alpha?.levels ? [alpha.levels] : [],
        );

  if (ranges.length === 0) return undefined;

  return levelLabel({
    levels: [
      Math.min(...ranges.map(([min]) => min)),
      Math.max(...ranges.map(([, max]) => max)),
    ],
  } as Encounter);
};

const sharedChance = (encounters: Array<Encounter>) => {
  const labels = encounters.map(chanceLabel);

  return labels.every((label) => label === labels[0]) ? labels[0] : undefined;
};

const detailLines = (encounters: Array<Encounter>) => {
  const [first] = encounters;

  if (encounters.length === 1) {
    return [alphaLabel(first), first.note].filter((line): line is string =>
      Boolean(line),
    );
  }

  const headline = levelRange(encounters);
  const shared = sharedChance(encounters);
  const notes = new Set<string>();

  return encounters.flatMap((encounter) => {
    const note =
      encounter.note && !notes.has(encounter.note) ? encounter.note : undefined;
    const levels = levelLabel(encounter);
    const chance = chanceLabel(encounter);

    if (note) notes.add(note);

    const line = [
      levels !== headline ? levels : undefined,
      alphaLabel(encounter),
      !shared && chance ? `${chance} chance` : undefined,
      note,
    ]
      .filter(Boolean)
      .join(' · ');

    return line ? [line] : [];
  });
};

const highlightHandlersFor = (
  highlightKey: string | undefined,
  onHighlight: EncounterListProps['onHighlight'],
) =>
  highlightKey && onHighlight
    ? {
        onMouseEnter: () => onHighlight(highlightKey),
        onMouseLeave: () => onHighlight(undefined),
        onFocus: () => onHighlight(highlightKey),
        onBlur: () => onHighlight(undefined),
      }
    : {};

const EncounterRow = ({
  row,
  encounters,
  sprite,
  linked = false,
  highlightKeyFor,
  onHighlight,
}: EncounterRowProps) => {
  const { entry } = row;
  const chance = sharedChance(encounters);
  const details = detailLines(encounters);
  const levels = levelRange(encounters);
  const highlightHandlers = highlightHandlersFor(
    highlightKeyFor?.(row),
    onHighlight,
  );
  const nameClassName = 'truncate text-[13px] font-medium';

  return (
    <li className="flex items-center gap-2 pt-1 pb-2">
      <img
        src={sprite.src}
        alt=""
        width={96}
        height={96}
        loading="lazy"
        className={cn(
          'size-9 flex-none object-contain',
          sprite.pixelated && 'pixelated',
        )}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex min-w-0 items-center gap-2">
          {linked ? (
            <PokedexEntryLink
              number={entry.number}
              className={nameClassName}
              {...highlightHandlers}
            >
              {entry.name}
            </PokedexEntryLink>
          ) : (
            <span className={nameClassName} {...highlightHandlers}>
              {entry.name}
            </span>
          )}
          {levels && (
            <span className="shrink-0 text-xs text-muted-foreground">
              {levels}
            </span>
          )}
        </div>
        <PokemonTypeTags types={entry.types} />
        {details.length > 0 && (
          <p className="text-xs text-muted-foreground">{details.join(' · ')}</p>
        )}
      </div>
      {chance && (
        <span
          title="Chance to appear here"
          className="text-[13px] font-medium tabular-nums"
        >
          {chance}
          <span className="sr-only"> chance to appear</span>
        </span>
      )}
    </li>
  );
};

const EncounterCard = ({
  row,
  encounters,
  sprite,
  linked = false,
  highlightKeyFor,
  onHighlight,
}: EncounterRowProps) => {
  const { entry } = row;
  const chance = sharedChance(encounters);
  const details = detailLines(encounters);
  const levels = levelRange(encounters);

  return (
    <li
      {...highlightHandlersFor(highlightKeyFor?.(row), onHighlight)}
      className="flex flex-col gap-2.5 rounded-xl border bg-muted/30 p-2.5 transition-colors hover:bg-muted/60"
    >
      <div className="flex items-start gap-3">
        <img
          src={sprite.src}
          alt=""
          width={96}
          height={96}
          loading="lazy"
          className={cn(
            'size-14 flex-none rounded-lg bg-muted object-contain p-1',
            sprite.pixelated && 'pixelated',
          )}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex min-w-0 items-center gap-2">
            {linked ? (
              <PokedexEntryLink
                number={entry.number}
                className="truncate text-sm font-medium"
              >
                {entry.name}
              </PokedexEntryLink>
            ) : (
              <span className="truncate text-sm font-medium">{entry.name}</span>
            )}
            {levels && (
              <span className="shrink-0 text-xs text-muted-foreground">
                {levels}
              </span>
            )}
          </div>
          <PokemonTypeTags types={entry.types} />
        </div>
        {chance && (
          <span
            title="Chance to appear here"
            className="shrink-0 text-xs font-medium text-muted-foreground tabular-nums"
          >
            {chance}
            <span className="sr-only"> chance to appear</span>
          </span>
        )}
      </div>
      {details.length === 1 && (
        <p className="border-t pt-2 text-xs text-muted-foreground">
          {details[0]}
        </p>
      )}
      {details.length > 1 && (
        <ul className="flex list-disc flex-col gap-0.5 border-t pt-2 pl-4 text-xs text-muted-foreground marker:text-muted-foreground/60">
          {details.map((line, index) => (
            <li key={`${index}-${line}`}>{line}</li>
          ))}
        </ul>
      )}
    </li>
  );
};
