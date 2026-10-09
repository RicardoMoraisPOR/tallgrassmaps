import { useId, useState } from 'react';

import { ChevronDown, ExternalLink } from 'lucide-react';

import { Collapse } from '@/components/Collapse';
import { PlacesMap } from '@/components/map/PlacesMap';
import { Button } from '@/components/ui/button';
import { gamesSharingMap } from '@/data/games';
import { usePokemonSprite } from '@/hooks/usePokemonSprite';
import { cn } from '@/lib/utils';

import { ColorDot } from '../../ColorDot';
import { EncounterPlaces } from '../EncounterPlaces';
import {
  encounterPaths,
  encountersIn,
  evolutionSummary,
  gamesWithEntry,
  isObtainable,
  placesMapLabel,
  tradeOnlyNote,
} from '../entryDetails';
import { bulbapediaUrl } from '../format';
import { MegaEvolutions } from '../MegaEvolutions';
import { PokemonTypeTags } from '../PokemonTypeTags';
import type { PokedexRowProps } from '../types';
import { useScrollToFocused } from '../useScrollToFocused';

export const TallGrassRow = ({
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
      className="rounded-[12px] border bg-card"
    >
      <div className="flex items-center gap-3 p-2.5">
        <span className="w-10 flex-none font-mono text-xs text-muted-foreground tabular-nums">
          #{String(entry.id).padStart(3, '0')}
        </span>
        <span className="flex size-12 flex-none items-center justify-center rounded-lg bg-muted">
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
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span
            className={cn(
              'min-w-0 truncate font-medium',
              !obtainable && 'text-muted-foreground',
            )}
          >
            {entry.name}
          </span>
          <PokemonTypeTags types={entry.types} />
        </div>
        <Button
          variant="ghost"
          size="sm"
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={() => setExpanded((current) => !current)}
          className="group flex-none"
        >
          More info
          <span className="sr-only"> about {entry.name}</span>
          <ChevronDown
            aria-hidden
            className="transition-transform group-aria-expanded:rotate-180"
          />
        </Button>
      </div>
      <Collapse
        open={expanded}
        id={panelId}
        className="flex flex-col gap-4 border-t p-3"
      >
        <MegaEvolutions entry={entry} compact TypeTags={PokemonTypeTags} />
        {appearsIn.length === 0 ? (
          evolution ? null : (
            <p className="text-[13px] text-muted-foreground">
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
                    className="inline-flex h-6 items-center gap-1.5 rounded-full border px-2 text-xs font-medium"
                  >
                    <ColorDot color={other.colors[0]} />
                    {other.shortName}
                  </li>
                ))}
              </ul>
              {!obtainable && (
                <p className="text-[13px] text-muted-foreground">
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
              <ul className="flex flex-col divide-y rounded-lg border text-[13px]">
                <EncounterPlaces
                  encounters={encounters}
                  region={region}
                  href={href}
                  nameOf={nameOf}
                  placeClassName="font-medium"
                  lineClassName="text-muted-foreground"
                  noteClassName="text-xs"
                />
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
          className="inline-flex items-center gap-1.5 self-start text-[13px] font-medium underline underline-offset-3"
        >
          {entry.name} on Bulbapedia
          <ExternalLink aria-hidden className="size-3.5" />
        </a>
      </Collapse>
    </li>
  );
};
