import { Fragment, useMemo, useState } from 'react';

import { Link } from 'react-router';

import { Button } from '@/components/ui/button';

import { ALL, filterSpots, placesOf, type Spot } from './pokemonProfile';

const COLLAPSED_PLACES = 5;

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

export const PokemonLocations = ({
  spots,
  game,
  emptyNote,
}: {
  spots: Array<Spot>;
  game: string;
  emptyNote: string;
}) => {
  const [expanded, setExpanded] = useState(false);

  const filtered = useMemo(
    () => filterSpots(spots, { game, group: ALL, query: '' }),
    [spots, game],
  );
  const places = useMemo(() => placesOf(filtered), [filtered]);
  const regionNames = new Set(filtered.map(({ regionName }) => regionName));
  const visiblePlaces = expanded ? places : places.slice(0, COLLAPSED_PLACES);
  const hidden = places.length - visiblePlaces.length;

  if (spots.length === 0) {
    return <p className="text-xs text-muted-foreground">{emptyNote}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
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
                      const badges = [row.form].filter(Boolean);

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
