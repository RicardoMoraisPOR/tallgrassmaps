import { Link } from 'react-router';

import type { Encounter } from '@/data/pokedex/types';
import { cn } from '@/lib/utils';

import { encounterLines, placeName } from './entryDetails';
import type { PokedexContext } from './types';

type PlaceGroup = { path: string | null; encounters: Array<Encounter> };

const groupByPath = (encounters: Array<Encounter>) =>
  encounters.reduce<Array<PlaceGroup>>((groups, encounter) => {
    const group = groups.find(({ path }) => path === encounter.path);

    if (group) group.encounters.push(encounter);
    else groups.push({ path: encounter.path, encounters: [encounter] });

    return groups;
  }, []);

const groupDetails = (
  encounters: Array<Encounter>,
  nameOf: (number: number) => string,
) => {
  const results = encounters.map((encounter) =>
    encounterLines(encounter, nameOf),
  );

  return {
    lines: results.flatMap(({ lines }) => lines),
    notes: [...new Set(results.flatMap(({ note }) => (note ? [note] : [])))],
  };
};

type EncounterPlacesProps = Pick<
  PokedexContext,
  'region' | 'href' | 'nameOf'
> & {
  encounters: Array<Encounter>;
  placeClassName: string;
  lineClassName: string;
  noteClassName: string;
};

export const EncounterPlaces = ({
  encounters,
  region,
  href,
  nameOf,
  placeClassName,
  lineClassName,
  noteClassName,
}: EncounterPlacesProps) =>
  groupByPath(encounters).map(({ path, encounters: grouped }) => {
    const { lines, notes } = groupDetails(grouped, nameOf);

    return (
      <li
        key={path ?? 'anywhere'}
        className="flex items-start justify-between gap-x-3 px-3 py-2"
      >
        <div className="flex flex-col gap-0.5">
          {path ? (
            <Link
              to={href(path)}
              className={cn(
                'underline-offset-3 hover:underline',
                placeClassName,
              )}
            >
              {placeName(region, path)}
            </Link>
          ) : (
            <span className={placeClassName}>Any water</span>
          )}
          {notes.map((note) => (
            <span key={note} className={noteClassName}>
              {note}
            </span>
          ))}
        </div>
        <div
          className={cn(
            'flex flex-col items-end gap-0.5 text-right',
            lineClassName,
          )}
        >
          {lines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </div>
      </li>
    );
  });
