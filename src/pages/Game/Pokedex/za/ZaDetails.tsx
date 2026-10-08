import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router';

import { PlacesMap } from '@/components/map/PlacesMap';
import { gamesSharingMap } from '@/data/games';

import { ColorDot } from '../../ColorDot';
import {
  encounterPaths,
  encountersIn,
  encounterSummary,
  evolutionSummary,
  gamesWithEntry,
  isObtainable,
  placeName,
  placesMapLabel,
  tradeOnlyNote,
} from '../entryDetails';
import { bulbapediaUrl } from '../format';
import type { PokedexRowProps } from '../types';

export const ZaDetails = ({
  entry,
  game,
  region,
  href,
  nameOf,
}: PokedexRowProps) => {
  const obtainable = isObtainable(entry, game);
  const appearsIn = gamesWithEntry(entry, game);
  const sharedMap = gamesSharingMap(game).length > 1;
  const encounters = encountersIn(entry, game);
  const paths = encounterPaths(encounters);
  const evolution = evolutionSummary(entry, nameOf);

  return (
    <div className="flex flex-col gap-4 text-base">
      {appearsIn.length === 0 ? (
        <p className="text-white/70">
          Not obtainable in these games without trading or events.
        </p>
      ) : (
        sharedMap && (
          <div className="flex flex-col gap-2">
            <ul aria-label="Available in" className="flex flex-wrap gap-1.5">
              {appearsIn.map((other) => (
                <li
                  key={other.id}
                  className="inline-flex h-6 items-center gap-1.5 rounded-md border border-white/25 px-2 text-sm font-bold"
                >
                  <ColorDot color={other.colors[0]} />
                  {other.shortName}
                </li>
              ))}
            </ul>
            {!obtainable && (
              <p className="text-white/70">{tradeOnlyNote(entry, game)}</p>
            )}
          </div>
        )
      )}
      {obtainable && (encounters.length > 0 || evolution) && (
        <div className="flex flex-col gap-3">
          {paths.length > 0 && (
            <PlacesMap
              region={region}
              paths={paths}
              label={placesMapLabel(entry, game, region, paths)}
            />
          )}
          <ul className="flex flex-col divide-y divide-white/15 rounded-lg border border-white/20">
            {encounters.map((encounter) => (
              <li
                key={`${encounter.method}-${encounter.path}-${encounter.tradeFor}`}
                className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 px-3 py-2"
              >
                {encounter.path ? (
                  <Link
                    to={href(encounter.path)}
                    className="font-bold underline-offset-3 hover:underline"
                  >
                    {placeName(region, encounter.path)}
                  </Link>
                ) : (
                  <span className="font-bold">Any water</span>
                )}
                <span className="text-white/70">
                  {encounterSummary(encounter, nameOf)}
                </span>
              </li>
            ))}
            {evolution && (
              <li className="px-3 py-2 text-white/70">{evolution}</li>
            )}
          </ul>
        </div>
      )}
      <a
        href={bulbapediaUrl(entry.name)}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 self-start font-bold underline underline-offset-3"
      >
        {entry.name} on Bulbapedia
        <ExternalLink aria-hidden className="size-3.5" />
      </a>
    </div>
  );
};
