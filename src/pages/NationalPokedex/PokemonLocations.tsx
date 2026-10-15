import { Fragment, useMemo, useState } from 'react';

import { Search } from 'lucide-react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import {
  ALL,
  filterSpots,
  methodGroups,
  placesOf,
  type Spot,
} from './pokemonProfile';

const COLLAPSED_PLACES = 5;
const SEARCH_THRESHOLD = 10;

type ChipOption = { value: string; label: string; count: number };

const Chips = ({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Array<ChipOption>;
  value: string;
  onChange: (value: string) => void;
}) => (
  <div role="group" aria-label={label} className="flex flex-wrap gap-1.5">
    {options.map((option) => (
      <button
        key={option.value}
        type="button"
        aria-pressed={option.value === value}
        onClick={() => onChange(option.value)}
        className={cn(
          'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs outline-none hover:bg-muted/60 focus-visible:ring-[3px] focus-visible:ring-ring/50',
          option.value === value && 'border-foreground/40 bg-muted font-medium',
        )}
      >
        {option.label}
        <span className="text-muted-foreground tabular-nums">
          {option.count}
        </span>
      </button>
    ))}
  </div>
);

const RowLines = ({
  row,
  badges,
}: {
  row: Spot;
  badges: Array<string | undefined>;
}) => {
  const content = (
    <>
      {row.lines.map((line) => (
        <span key={line}>{line}</span>
      ))}
      {badges.length > 0 && (
        <span className="text-[11px]">{badges.join(' · ')}</span>
      )}
    </>
  );

  return row.floorLabel && row.link ? (
    <Link
      to={row.link.to}
      state={row.link.state}
      className="flex flex-col items-end underline-offset-3 hover:text-foreground hover:underline"
    >
      {content}
    </Link>
  ) : (
    <div className="flex flex-col items-end">{content}</div>
  );
};

const placeCount = (spots: Array<Spot>) =>
  new Set(spots.map(({ key }) => key)).size;

export const PokemonLocations = ({
  spots,
  emptyNote,
}: {
  spots: Array<Spot>;
  emptyNote: string;
}) => {
  const [game, setGame] = useState(ALL);
  const [group, setGroup] = useState(ALL);
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(false);

  const gameOptions = useMemo(() => {
    const byId = new Map<string, ChipOption & { keys: Set<string> }>();

    for (const spot of spots) {
      for (const { id, shortName } of spot.games) {
        const current = byId.get(id) ?? {
          value: id,
          label: shortName,
          count: 0,
          keys: new Set<string>(),
        };

        current.keys.add(spot.key);
        byId.set(id, { ...current, count: current.keys.size });
      }
    }

    return [...byId.values()];
  }, [spots]);
  const groupOptions = useMemo(
    () =>
      methodGroups.flatMap((value) => {
        const count = placeCount(spots.filter((spot) => spot.group === value));

        return count > 0 ? [{ value, label: value, count }] : [];
      }),
    [spots],
  );
  const filtered = useMemo(
    () => filterSpots(spots, { game, group, query }),
    [spots, game, group, query],
  );
  const places = useMemo(() => placesOf(filtered), [filtered]);
  const totalPlaces = placeCount(spots);
  const regionNames = new Set(spots.map(({ regionName }) => regionName));
  const visiblePlaces = expanded ? places : places.slice(0, COLLAPSED_PLACES);
  const hidden = places.length - visiblePlaces.length;

  if (spots.length === 0) {
    return <p className="text-xs text-muted-foreground">{emptyNote}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">
        {totalPlaces} {totalPlaces === 1 ? 'place' : 'places'} across{' '}
        {gameOptions.length} {gameOptions.length === 1 ? 'game' : 'games'}
      </p>
      {gameOptions.length > 1 && (
        <Chips
          label="Filter by game"
          value={game}
          onChange={setGame}
          options={[
            { value: ALL, label: 'All games', count: totalPlaces },
            ...gameOptions,
          ]}
        />
      )}
      {groupOptions.length > 1 && (
        <Chips
          label="Filter by how to find it"
          value={group}
          onChange={setGroup}
          options={[
            { value: ALL, label: 'Any method', count: totalPlaces },
            ...groupOptions,
          ]}
        />
      )}
      {totalPlaces > SEARCH_THRESHOLD && (
        <div className="relative">
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search places…"
            aria-label="Search places"
            className="h-9 pl-8"
          />
        </div>
      )}
      {places.length === 0 ? (
        <p className="py-4 text-center text-xs text-muted-foreground">
          No places match these filters.
        </p>
      ) : (
        <ul className="flex flex-col divide-y rounded-sm border">
          {visiblePlaces.map(
            ({ key, label, regionName, link, spots: rows }, index) => (
              <Fragment key={key}>
                {regionNames.size > 1 &&
                  regionName !== visiblePlaces[index - 1]?.regionName && (
                    <li
                      aria-hidden
                      className="bg-muted/50 px-3 py-1 text-[11px] font-medium tracking-wider text-muted-foreground uppercase first:rounded-t-[10px]"
                    >
                      {regionName}
                    </li>
                  )}
                <li className="flex items-start justify-between gap-x-4 px-3 py-2 text-xs">
                  {link ? (
                    <Link
                      to={link.to}
                      state={link.state}
                      className="font-medium underline-offset-3 hover:underline"
                    >
                      {label}
                    </Link>
                  ) : (
                    <span className="font-medium">{label}</span>
                  )}
                  <div className="flex flex-col items-end gap-1 text-right text-muted-foreground">
                    {rows.map((row, rowIndex) => {
                      const badges = [
                        row.form,
                        ...(game === ALL && row.games.length < row.regionGames
                          ? row.games.map(({ shortName }) => shortName)
                          : []),
                      ].filter(Boolean);

                      return (
                        <RowLines key={rowIndex} row={row} badges={badges} />
                      );
                    })}
                  </div>
                </li>
              </Fragment>
            ),
          )}
        </ul>
      )}
      {(hidden > 0 || expanded) && places.length > COLLAPSED_PLACES && (
        <Button
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? 'Show fewer' : `Show ${hidden} more`}
        </Button>
      )}
    </div>
  );
};
