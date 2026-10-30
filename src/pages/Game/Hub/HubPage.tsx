import { type ReactNode, useMemo, useState } from 'react';

import { Search } from 'lucide-react';
import { Link } from 'react-router';

import { Container } from '@/components/Container';
import { getCover } from '@/data/covers';
import { platformParts } from '@/data/games';
import { getLocationTrail, regionHref } from '@/data/maps';
import type { GameRoute } from '@/hooks/useGameRoute';
import { ENTER, enterDelay } from '@/lib/enter';
import { trailPath } from '@/lib/paths';
import { cn } from '@/lib/utils';
import { useRecentPlacesStore } from '@/stores/recentPlaces';

import { extrasFor } from '../Extras/extras';
import { ExtrasDialog } from '../Extras/ExtrasDialog';
import type { GameExtra } from '../Extras/types';
import { Pokedex } from '../Pokedex/Pokedex';
import { hasPokedex } from '../Pokedex/pokedexViews';
import { usePokedexLink } from '../Pokedex/usePokedex';
import { gameStats, pokemonStats, worldStats } from '../Region/gameStats';
import { DataLakeLink, RelatedGames, StatGrid } from '../Region/GameSummary';
import { searchShortcut, useOpenPlaceSearch } from '../Search/searchContext';
import { HubHeader } from './HubHeader';
import { MapTag } from './MapTag';
import { MapTile } from './MapTile';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
const STAGGER_SECONDS = 0.05;

const dateFormat = new Intl.DateTimeFormat('en', { dateStyle: 'long' });

const Block = ({
  title,
  index,
  children,
}: {
  title: string;
  index: number;
  children: ReactNode;
}) => {
  return (
    <section
      className={cn('flex flex-col gap-4', ENTER)}
      style={enterDelay(index * STAGGER_SECONDS)}
    >
      <h2 className="font-heading text-xl font-bold tracking-tight">{title}</h2>
      {children}
    </section>
  );
};

const linkCard =
  'group flex flex-col justify-between gap-6 rounded-sm border bg-card p-5 outline-none transition-colors hover:border-foreground/40 focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none';

export const HubPage = ({ route }: { route: GameRoute }) => {
  const { game, region, regions, href } = route;
  const openSearch = useOpenPlaceSearch();
  const cover = getCover(game.id);
  const pokedexLink = usePokedexLink();
  const stats = useMemo(() => gameStats(game, region), [game, region]);
  const [extra, setExtra] = useState<GameExtra>();
  const extras = extrasFor(region.versionGroup) ?? [];
  const recentPaths = useRecentPlacesStore((state) => state.places[game.id]);
  const recent = (recentPaths ?? []).flatMap((path) => {
    const trail = getLocationTrail(region, path);

    return trail?.length ? [{ path: trailPath(trail), trail }] : [];
  });

  return (
    <>
      <Container size="wide" className="flex flex-col gap-12 pt-32 pb-20">
        <HubHeader cover={cover} title={game.fullName}>
          <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-sm text-muted-foreground sm:justify-start sm:text-left">
            <span className="font-semibold">
              {platformParts[game.platform].map(({ text, color }, index) => (
                <span key={index} style={color ? { color } : undefined}>
                  {text}
                </span>
              ))}
            </span>
            <span aria-hidden>·</span>
            <span>Generation {ROMAN[game.generation - 1]}</span>
            <span aria-hidden>·</span>
            <MapTag versionGroup={region.versionGroup} />
            <span aria-hidden>·</span>
            <time dateTime={game.releaseDate}>
              {dateFormat.format(new Date(`${game.releaseDate}T00:00:00`))}
            </time>
            <span aria-hidden>·</span>
            <span>{game.developer}</span>
          </p>
        </HubHeader>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-12">
          <Block title="Maps" index={2}>
            <ul className="flex flex-col gap-4">
              {regions.map((entry, index) => (
                <li
                  key={entry.id}
                  className={ENTER}
                  style={enterDelay(0.3 + index * STAGGER_SECONDS)}
                >
                  <MapTile
                    name={entry.name}
                    font={entry.titleFont}
                    versionGroup={entry.versionGroup}
                    image={entry.image}
                    pixelated={entry.pixelated}
                    to={regionHref(game.id, entry)}
                  />
                </li>
              ))}
            </ul>
          </Block>

          <div className="flex flex-col gap-8">
            <Block title="Find what you want" index={3}>
              {hasPokedex(region) && (
                <Link
                  {...pokedexLink}
                  className="flex h-11 shrink-0 items-center justify-between gap-3 rounded-sm border bg-card px-3.5 text-sm transition-colors outline-none hover:border-foreground/40 focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none"
                >
                  <span className="font-medium">Pokédex</span>
                  <span className="truncate text-muted-foreground">
                    Where to find every Pokémon
                  </span>
                </Link>
              )}
              <DataLakeLink region={region} />
              <button
                type="button"
                onClick={() => openSearch()}
                className="flex h-12 w-full items-center gap-3 rounded-sm border bg-card px-4 text-left text-sm text-muted-foreground transition-colors outline-none hover:border-foreground/40 focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none"
              >
                <Search aria-hidden className="size-4 flex-none" />
                <span className="min-w-0 flex-1 truncate">
                  Search this game
                </span>
                <kbd className="rounded hidden border bg-muted px-1.5 py-0.5 font-sans text-[11px] sm:block">
                  {searchShortcut()}
                </kbd>
              </button>
              {recent.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-muted-foreground">
                    Recently viewed
                  </p>
                  <ul className="flex flex-wrap gap-2">
                    {recent.map(({ path, trail }) => (
                      <li key={path}>
                        <Link
                          to={href(path)}
                          className="inline-flex h-8 items-center gap-2 rounded-sm border px-3 text-sm font-medium transition-colors outline-none hover:border-foreground/40 focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none"
                        >
                          {trail[trail.length - 1].name}
                          {trail.length > 1 && (
                            <span className="font-normal text-muted-foreground">
                              {trail[0].name}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {extras.length > 0 && (
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  {extras.map((entry) => (
                    <li key={entry.id}>
                      <button
                        type="button"
                        onClick={() => setExtra(entry)}
                        className={cn(linkCard, 'w-full text-left')}
                      >
                        <span className="font-heading text-xl font-bold">
                          {entry.title}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {entry.count} entries
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Block>

            <Block title="Pokémon in this game" index={4}>
              <StatGrid stats={pokemonStats(game, stats)} />
            </Block>

            <Block title="About this game" index={5}>
              <StatGrid stats={worldStats(stats)} />
            </Block>

            <Block title="Related" index={6}>
              <RelatedGames game={game} />
            </Block>
          </div>
        </div>
      </Container>
      <ExtrasDialog
        game={game}
        region={region}
        extra={extra}
        onOpenChange={(open) => !open && setExtra(undefined)}
      />
      <Pokedex game={game} region={region} href={href} />
    </>
  );
};
