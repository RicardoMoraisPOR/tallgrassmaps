import { useId, useState } from 'react';

import { ChevronDown, ExternalLink } from 'lucide-react';
import { Link } from 'react-router';

import { Collapse } from '@/components/Collapse';
import { Button } from '@/components/ui/button';
import { type Game, gamesSharingMap } from '@/data/games';
import { getLocation, type Region } from '@/data/maps';
import type { PokedexEntry } from '@/data/pokedex/types';
import { pokemonSprite } from '@/data/sprites';
import { formatList } from '@/lib/utils';

import { ColorDot } from '../../ColorDot';
import {
  bulbapediaUrl,
  dexNumber,
  evolutionLabel,
  levelLabel,
  methodLabel,
} from '../format';
import { PlacesMap } from '../PlacesMap';

type PokedexRowProps = {
  entry: PokedexEntry;
  game: Game;
  region: Region;
  href: (path: string) => string;
  nameOf: (number: number) => string;
};

export const PokedexRow = ({
  entry,
  game,
  region,
  href,
  nameOf,
}: PokedexRowProps) => {
  const [expanded, setExpanded] = useState(false);
  const panelId = useId();

  const inGame = entry.games.includes(game.id);

  return (
    <li className="rounded-[12px] border bg-card">
      <div className="flex items-center gap-3 p-2">
        <span className="w-10 flex-none font-mono text-xs text-muted-foreground tabular-nums">
          {dexNumber(entry.number)}
        </span>
        <span className="flex size-12 flex-none items-center justify-center rounded-lg bg-muted">
          <img
            src={pokemonSprite(entry.number)}
            alt=""
            width={96}
            height={96}
            loading="lazy"
            className="size-12 object-contain"
          />
        </span>
        <span
          className={
            inGame
              ? 'min-w-0 flex-1 truncate font-medium'
              : 'min-w-0 flex-1 truncate font-medium text-muted-foreground'
          }
        >
          {entry.name}
        </span>
        <Button
          variant="ghost"
          size="sm"
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={() => setExpanded((current) => !current)}
          className="group flex-none"
        >
          More info<span className="sr-only"> about {entry.name}</span>
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
          className="inline-flex items-center gap-1.5 self-start text-[13px] font-medium underline underline-offset-3"
        >
          {entry.name} on Bulbapedia
          <ExternalLink aria-hidden className="size-3.5" />
        </a>
      </Collapse>
    </li>
  );
};

const GameTags = ({ entry, game }: { entry: PokedexEntry; game: Game }) => {
  const appearsIn = gamesSharingMap(game).filter((other) =>
    entry.games.includes(other.id),
  );

  if (appearsIn.length === 0) {
    return (
      <p className="text-[13px] text-muted-foreground">
        Not obtainable in these games without trading or events.
      </p>
    );
  }

  return (
    <ul aria-label="Appears in" className="flex flex-wrap gap-1.5">
      {appearsIn.map((other) => (
        <li
          key={other.id}
          className="inline-flex h-6 items-center gap-1.5 rounded-full border px-2 text-xs font-medium"
        >
          <ColorDot color={other.colors[0]} />
          {other.name.replace(/^Pokémon /, '')}
        </li>
      ))}
    </ul>
  );
};

const Places = ({ entry, game, region, href, nameOf }: PokedexRowProps) => {
  const encounters = entry.encounters.filter((encounter) =>
    encounter.games.includes(game.id),
  );
  const paths = encounters.flatMap((encounter) =>
    encounter.path ? [encounter.path] : [],
  );
  const shortName = game.name.replace(/^Pokémon /, '');

  if (!entry.games.includes(game.id)) return null;

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
      <ul className="flex flex-col divide-y rounded-lg border text-[13px]">
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
