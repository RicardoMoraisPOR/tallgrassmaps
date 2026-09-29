import { BookOpen } from 'lucide-react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import type { Game } from '@/data/games';
import { type PokemonSprite, usePokemonSprite } from '@/hooks/usePokemonSprite';
import { cn } from '@/lib/utils';

import { chanceLabel, levelLabel, methodLabel } from '../Pokedex/format';
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
        options.compact && 'divide-y divide-border/60',
      )}
    >
      {rows.map((row) => (
        <EncounterRow
          key={row.entry.number}
          row={row}
          sprite={spriteFor(row.entry.number)}
          {...options}
        />
      ))}
    </ul>
  );
};

const EncounterRow = ({
  row,
  sprite,
  compact = false,
  linked = false,
  highlightKeyFor,
  onHighlight,
}: EncounterRowProps) => {
  const { entry, encounter } = row;
  const highlightKey = highlightKeyFor?.(row);
  const chance = chanceLabel(encounter);

  const nameClassName = cn(
    'truncate font-medium',
    compact ? 'text-[13px]' : 'text-sm',
  );
  const highlightHandlers =
    highlightKey && onHighlight
      ? {
          onMouseEnter: () => onHighlight(highlightKey),
          onMouseLeave: () => onHighlight(undefined),
          onFocus: () => onHighlight(highlightKey),
          onBlur: () => onHighlight(undefined),
        }
      : {};
  const pokemonName = linked ? (
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
  );
  return (
    <li
      className={cn(
        'flex items-center',
        compact ? 'gap-2 pt-1 pb-2' : 'gap-3 py-1.5',
      )}
    >
      <img
        src={sprite.src}
        alt=""
        width={96}
        height={96}
        loading="lazy"
        className={cn(
          'flex-none object-contain',
          compact ? 'size-7' : 'size-10',
          sprite.pixelated && 'pixelated',
        )}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex min-w-0 items-center gap-2">
          {pokemonName}
          <span className="shrink-0 text-xs text-muted-foreground">
            {levelLabel(encounter)}
          </span>
        </div>
        <PokemonTypeTags types={entry.types} compact={compact} />
      </div>
      {chance && (
        <span
          title="Chance to appear here"
          className={cn(
            'font-medium tabular-nums',
            compact ? 'text-[13px]' : 'text-sm',
          )}
        >
          {chance}
          <span className="sr-only"> chance to appear</span>
        </span>
      )}
    </li>
  );
};
