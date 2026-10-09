import { useId, useState } from 'react';

import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router';

import { Collapse } from '@/components/Collapse';
import { PlacesMap } from '@/components/map/PlacesMap';
import { Button } from '@/components/ui/button';
import { gamesSharingMap } from '@/data/games';
import { usePokemonSprite } from '@/hooks/usePokemonSprite';
import { cn } from '@/lib/utils';

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
import { PokemonTypeTags } from '../PokemonTypeTags';
import type { PokedexRowProps } from '../types';
import { useScrollToFocused } from '../useScrollToFocused';

export const RbyRow = ({
  entry,
  game,
  region,
  href,
  nameOf,
  focused = false,
}: PokedexRowProps) => {
  const [expanded, setExpanded] = useState(focused);
  const panelId = useId();
  const rowRef = useScrollToFocused(focused);
  const spriteFor = usePokemonSprite(game);

  const sprite = spriteFor(entry.number);
  const obtainable = isObtainable(entry, game);
  const appearsIn = gamesWithEntry(entry, game);
  const sharedMap = gamesSharingMap(game).length > 1;
  const encounters = encountersIn(entry, game);
  const paths = encounterPaths(encounters);
  const evolution = evolutionSummary(entry, nameOf);

  return (
    <li
      ref={rowRef}
      data-expanded={expanded || undefined}
      className="group/row border-b-2 border-dashed"
    >
      <div className="relative grid grid-cols-[auto_auto_auto_1fr_auto] grid-rows-[auto_auto] items-center gap-x-2 gap-y-1 overflow-y-clip px-2 py-3">
        <span
          aria-hidden
          className="row-span-2 text-[16px] leading-none opacity-0 group-hover/row:opacity-100 group-has-[:focus-visible]/row:opacity-100"
        >
          ▶
        </span>
        <span className="col-start-2 row-span-2 row-start-1 flex size-12 items-center justify-center">
          <img
            src={sprite.src}
            alt=""
            width={96}
            height={96}
            loading="lazy"
            className={cn(
              'size-12 object-contain',
              sprite.pixelated && 'pixelated',
            )}
          />
        </span>
        <span className="col-start-3 row-start-1 text-[10px] tabular-nums">
          {String(entry.id).padStart(3, '0')}
        </span>
        <span
          className={cn(
            'col-start-4 row-start-1 min-w-0 truncate text-[10px]',
            !obtainable && 'text-muted-foreground',
          )}
        >
          {entry.name}
        </span>
        <span className="col-span-2 col-start-3 row-start-2">
          <PokemonTypeTags types={entry.types} />
        </span>
        <Button
          variant="ghost"
          size="sm"
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={() => setExpanded((current) => !current)}
          className="relative col-start-5 row-span-2 row-start-1 gap-2 px-2 text-[10px]"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-y-16 left-[13px] w-0.5 bg-foreground"
          />
          <span aria-hidden className="gb-bullet relative inline-block" />
          <span aria-hidden>Data</span>
          <span className="sr-only">More info about {entry.name}</span>
        </Button>
      </div>
      <Collapse
        open={expanded}
        id={panelId}
        className="flex flex-col gap-4 border-t-4 border-double p-3 pb-4"
      >
        {appearsIn.length === 0 ? (
          evolution ? null : (
            <p className="text-[10px] leading-loose text-muted-foreground">
              Not obtainable in these games without trading or events.
            </p>
          )
        ) : (
          sharedMap && (
            <div className="flex flex-col gap-2">
              <ul aria-label="Available in" className="flex flex-wrap gap-1.5">
                {appearsIn.map((other) => (
                  <li
                    key={other.id}
                    className="inline-flex h-6 items-center gap-1.5 border-2 px-2 text-xs"
                  >
                    <ColorDot color={other.colors[0]} />
                    {other.shortName}
                  </li>
                ))}
              </ul>
              {!obtainable && (
                <p className="text-[10px] leading-loose text-muted-foreground">
                  {tradeOnlyNote(entry, game)}
                </p>
              )}
            </div>
          )
        )}
        {(obtainable || appearsIn.length === 0) &&
          (encounters.length > 0 || evolution) && (
            <div className="flex flex-col gap-3">
              {paths.length > 0 && (
                <PlacesMap
                  region={region}
                  paths={paths}
                  label={placesMapLabel(entry, game, region, paths)}
                />
              )}
              <ul className="flex flex-col divide-y border-2 text-[10px] leading-loose">
                {encounters.map((encounter) => (
                  <li
                    key={`${encounter.method}-${encounter.path}-${encounter.tradeFor}`}
                    className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 px-3 py-2"
                  >
                    {encounter.path ? (
                      <Link
                        to={href(encounter.path)}
                        className="underline-offset-3 hover:underline"
                      >
                        {placeName(region, encounter.path)}
                      </Link>
                    ) : (
                      <span>Any water</span>
                    )}
                    <span className="text-muted-foreground">
                      {encounterSummary(encounter, nameOf)}
                    </span>
                  </li>
                ))}
                {evolution && (
                  <li className="px-3 py-2 text-muted-foreground">
                    {evolution}
                  </li>
                )}
              </ul>
            </div>
          )}
        <a
          href={bulbapediaUrl(entry.name)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 self-start text-[10px] leading-loose underline underline-offset-3"
        >
          {entry.name} on Bulbapedia
          <ExternalLink aria-hidden className="size-3.5" />
        </a>
      </Collapse>
    </li>
  );
};
