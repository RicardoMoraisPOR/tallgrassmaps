import { useEffect, useId, useRef, useState } from 'react';

import { ChevronDown, ExternalLink } from 'lucide-react';
import { Link } from 'react-router';

import { Collapse } from '@/components/Collapse';
import { Button } from '@/components/ui/button';
import { type Game, gamesSharingMap } from '@/data/games';
import { getLocation, type Region } from '@/data/maps';
import type { PokedexEntry } from '@/data/pokedex/types';
import { usePokemonSprite } from '@/hooks/usePokemonSprite';
import { cn, formatList } from '@/lib/utils';

import { ColorDot } from '../ColorDot';
import { PokemonTypeTags } from './PokemonTypeTags';
import {
  bulbapediaUrl,
  evolutionLabel,
  levelLabel,
  methodLabel,
} from './format';
import { PlacesMap } from './PlacesMap';

type PokedexRowProps = {
  entry: PokedexEntry;
  game: Game;
  region: Region;
  href: (path: string) => string;
  nameOf: (number: number) => string;
  focused?: boolean;
};

export const PokedexRow = ({
  entry,
  game,
  region,
  href,
  nameOf,
  focused = false,
}: PokedexRowProps) => {
  const [expanded, setExpanded] = useState(focused);
  const panelId = useId();
  const rowRef = useRef<HTMLLIElement>(null);
  const spriteFor = usePokemonSprite(game);

  const sprite = spriteFor(entry.number);

  const inGame = entry.games.includes(game.id);

  useEffect(() => {
    if (focused) rowRef.current?.scrollIntoView({ block: 'start' });
  }, [focused]);

  return (
    <li
      ref={rowRef}
      data-expanded={expanded || undefined}
      className="group/row scroll-mt-36 rounded-[12px] border bg-card pokedex-game:rounded-none pokedex-game:border-0 pokedex-game:border-b-2 pokedex-game:border-dashed pokedex-game:bg-transparent"
    >
      <div className="relative flex items-center gap-3 p-2.5 pokedex-game:grid pokedex-game:grid-cols-[auto_auto_auto_1fr_auto] pokedex-game:grid-rows-[auto_auto] pokedex-game:gap-x-2 pokedex-game:gap-y-1 pokedex-game:overflow-y-clip pokedex-game:px-2 pokedex-game:py-3">
        <span
          aria-hidden
          className="hidden text-[16px] leading-none opacity-0 pokedex-game:row-span-2 pokedex-game:block pokedex-game:group-hover/row:opacity-100 pokedex-game:group-has-[:focus-visible]/row:opacity-100"
        >
          ▶
        </span>
        <span className="w-10 flex-none font-mono text-xs text-muted-foreground tabular-nums pokedex-game:col-start-3 pokedex-game:row-start-1 pokedex-game:w-auto pokedex-game:text-[10px] pokedex-game:text-foreground">
          <span className="pokedex-game:hidden">#</span>
          {String(entry.id).padStart(3, '0')}
        </span>
        <span className="flex size-12 flex-none items-center justify-center rounded-lg bg-muted pokedex-game:col-start-2 pokedex-game:row-span-2 pokedex-game:row-start-1 pokedex-game:bg-transparent">
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
        <div className="flex min-w-0 flex-1 flex-col gap-1 pokedex-game:contents">
          <span
            className={cn(
              'min-w-0 truncate font-medium pokedex-game:col-start-4 pokedex-game:row-start-1 pokedex-game:text-[10px]',
              !inGame && 'text-muted-foreground',
            )}
          >
            {entry.name}
          </span>
          <span className="pokedex-game:col-start-3 pokedex-game:col-span-2 pokedex-game:row-start-2">
            <PokemonTypeTags types={entry.types} />
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={() => setExpanded((current) => !current)}
          className="group flex-none pokedex-game:relative pokedex-game:col-start-5 pokedex-game:row-span-2 pokedex-game:row-start-1 pokedex-game:gap-2 pokedex-game:px-2 pokedex-game:text-[10px]"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-y-16 left-[13px] hidden w-0.5 bg-foreground pokedex-game:block"
          />
          <span
            aria-hidden
            className="gb-bullet relative hidden pokedex-game:inline-block"
          />
          <span className="pokedex-game:hidden">More info</span>
          <span aria-hidden className="hidden pokedex-game:inline">
            Data
          </span>
          <span className="sr-only"> about {entry.name}</span>
          <ChevronDown
            aria-hidden
            className="transition-transform group-aria-expanded:rotate-180 pokedex-game:hidden"
          />
        </Button>
      </div>
      <Collapse
        open={expanded}
        id={panelId}
        className="flex flex-col gap-4 border-t p-3 pokedex-game:border-t-4 pokedex-game:border-double pokedex-game:pb-4"
      >
        <GameTags entry={entry} game={game} />
        <Places
          entry={entry}
          game={game}
          region={region}
          href={href}
          nameOf={nameOf}
        />
        <a
          href={bulbapediaUrl(entry.name)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 self-start text-[13px] font-medium underline underline-offset-3 pokedex-game:text-[10px] pokedex-game:leading-loose"
        >
          {entry.name} on Bulbapedia
          <ExternalLink aria-hidden className="size-3.5" />
        </a>
      </Collapse>
    </li>
  );
};

const GameTags = ({ entry, game }: { entry: PokedexEntry; game: Game }) => {
  const games = gamesSharingMap(game);
  const appearsIn = games.filter((other) =>
    entry.games.includes(other.id),
  );

  if (appearsIn.length === 0) {
    return (
      <p className="text-[13px] text-muted-foreground pokedex-game:text-[10px] pokedex-game:leading-loose">
        Not obtainable in these games without trading or events.
      </p>
    );
  }

  if (games.length < 2) return null;

  return (
    <div className="flex flex-col gap-2">
      <ul aria-label="Available in" className="flex flex-wrap gap-1.5">
        {appearsIn.map((other) => (
          <li
            key={other.id}
            className="inline-flex h-6 items-center gap-1.5 rounded-full border px-2 text-xs font-medium pokedex-game:rounded-none pokedex-game:border-2"
          >
            <ColorDot color={other.colors[0]} />
            {other.shortName}
          </li>
        ))}
      </ul>
        {!entry.games.includes(game.id) && (
        <p className="text-[13px] text-muted-foreground pokedex-game:text-[10px] pokedex-game:leading-loose">
          Only obtainable in {game.fullName} by trading from{' '}
          {formatList(appearsIn.map((other) => other.fullName))}.
        </p>
      )}
    </div>
  );
};

const Places = ({
  entry,
  game,
  region,
  href,
  nameOf,
}: Omit<PokedexRowProps, 'entry'> & {
  entry: PokedexEntry;
}) => {
  const encounters = entry.encounters.filter((encounter) =>
    encounter.games.includes(game.id),
  );
  const paths = encounters.flatMap((encounter) =>
    encounter.path ? [encounter.path] : [],
  );
  const shortName = game.shortName;

  if (!entry.games.includes(game.id)) return null;
  if (encounters.length === 0 && !entry.evolvesFrom) return null;

  return (
    <div className="flex flex-col gap-3">
      {paths.length > 0 && (
        <PlacesMap
          region={region}
          paths={paths}
          label={`${region.name} Town Map highlighting where to find ${entry.name} in ${shortName}: ${formatList(
            [...new Set(paths)].map(
              (path) => getLocation(region, path)?.name ?? path,
            ),
          )}`}
        />
      )}
      <ul className="flex flex-col divide-y rounded-lg border text-[13px] pokedex-game:border-2 pokedex-game:text-[10px] pokedex-game:leading-loose">
        {encounters.map((encounter) => (
          <li
            key={`${encounter.method}-${encounter.path}-${encounter.tradeFor}`}
            className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 px-3 py-2"
          >
            {encounter.path ? (
              <Link
                to={href(encounter.path)}
                className="font-medium underline-offset-3 hover:underline"
              >
                {getLocation(region, encounter.path)?.name ?? encounter.path}
              </Link>
            ) : (
              <span className="font-medium">Any water</span>
            )}
            <span className="text-muted-foreground">
              {[
                encounter.tradeFor
                  ? `${methodLabel(encounter)} for ${nameOf(encounter.tradeFor)}`
                  : methodLabel(encounter),
                levelLabel(encounter),
              ]
                .filter(Boolean)
                .join(' · ')}
            </span>
          </li>
        ))}
        {entry.evolvesFrom && (
          <li className="px-3 py-2 text-muted-foreground">
            Evolve {nameOf(entry.evolvesFrom.number)}{' '}
            {evolutionLabel(entry.evolvesFrom)}
          </li>
        )}
      </ul>
    </div>
  );
};
