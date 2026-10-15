import { type ReactNode, useMemo, useState } from 'react';

import { ArrowUpRight, Search } from 'lucide-react';
import { m } from 'motion/react';
import { Link } from 'react-router';

import { Container } from '@/components/Container';
import {
  versionGroupNames,
  versionGroupParts,
} from '@/data/catalog/versionGroups';
import { getCover } from '@/data/covers';
import { platformParts } from '@/data/games';
import { getLocationTrail, regionHref } from '@/data/maps';
import type { GameRoute } from '@/hooks/useGameRoute';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { ENTER, enterDelay } from '@/lib/enter';
import { trailPath } from '@/lib/paths';
import { cn, formatList } from '@/lib/utils';
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

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
const STAGGER_SECONDS = 0.08;

const dateFormat = new Intl.DateTimeFormat('en', { dateStyle: 'long' });

const MapTag = ({ region }: { region: GameRoute['region'] }) => (
  <span
    title={`Same maps in ${formatList(versionGroupNames(region.versionGroup))}`}
    className="inline-flex h-6 items-center rounded-full border bg-muted/50 px-2.5 text-xs font-medium text-foreground"
  >
    {versionGroupParts(region.versionGroup).map(({ text, color }, index) => (
      <span key={index} style={color ? { color } : undefined}>
        {text}
      </span>
    ))}
    &nbsp;map
  </span>
);

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
  'group flex flex-col justify-between gap-6 rounded-xl border bg-card p-5 outline-none transition-colors hover:border-foreground/40 focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none';

export const HubPage = ({ route }: { route: GameRoute }) => {
  const { game, region, href } = route;
  const openSearch = useOpenPlaceSearch();
  const reducedMotion = usePrefersReducedMotion();
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
        <header className="flex flex-col items-center gap-5 sm:flex-row sm:items-end sm:gap-10">
          {cover && (
            <img
              src={cover}
              alt=""
              className={cn(
                'w-24 flex-none object-contain drop-shadow-[0_6px_14px_oklch(0_0_0/0.35)] sm:w-32 lg:w-40',
                ENTER,
              )}
            />
          )}
          <div className="flex min-w-0 flex-col items-center gap-3 pb-1 sm:items-start">
            <h1 className="flex justify-center gap-x-[0.25em] font-heading text-[clamp(1.5rem,8.2vw,3rem)] leading-[0.95] font-bold tracking-[-0.035em] sm:flex-wrap sm:justify-start sm:text-7xl lg:text-8xl">
              {game.fullName.split(' ').map((word, index) => (
                <span
                  key={index}
                  className="-my-[0.06em] block overflow-hidden py-[0.06em] whitespace-nowrap"
                >
                  <m.span
                    className="block"
                    initial={reducedMotion ? false : { y: '110%', rotate: 3 }}
                    animate={{ y: 0, rotate: 0 }}
                    transition={{
                      duration: 0.7,
                      delay: 0.1 + index * 0.08,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    style={{ transformOrigin: 'left bottom' }}
                  >
                    {word}
                  </m.span>
                </span>
              ))}
            </h1>
            <p className="flex flex-wrap justify-center gap-x-2 text-center text-sm text-muted-foreground sm:justify-start sm:text-left">
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
              <time dateTime={game.releaseDate}>
                {dateFormat.format(new Date(`${game.releaseDate}T00:00:00`))}
              </time>
              <span aria-hidden>·</span>
              <span>{game.developer}</span>
            </p>
          </div>
        </header>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-12">
          <Block title="Maps" index={2}>
            <ul className="grid gap-6">
              <li>
                <Link
                  to={regionHref(game.id, region)}
                  className="group flex flex-col gap-4 outline-none"
                >
                  <span className="rounded-xl relative block aspect-16/10 overflow-hidden border bg-muted transition-colors group-hover:border-foreground/40 group-focus-visible:ring-[3px] group-focus-visible:ring-ring/50 motion-reduce:transition-none">
                    <img
                      src={region.image}
                      alt=""
                      className="size-full object-contain p-4 [image-rendering:pixelated]"
                    />
                  </span>
                  <span className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <span className="font-heading text-3xl font-bold tracking-tight">
                      {region.name}
                      <ArrowUpRight
                        aria-hidden
                        className="ml-1 inline size-6 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
                      />
                    </span>
                    <MapTag region={region} />
                  </span>
                </Link>
              </li>
            </ul>
          </Block>

          <div className="flex flex-col gap-8">
            <Block title="Find what you want" index={3}>
              <button
                type="button"
                onClick={() => openSearch()}
                className="flex h-12 w-full items-center gap-3 rounded-lg border bg-card px-4 text-left text-sm text-muted-foreground transition-colors outline-none hover:border-foreground/40 focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none"
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
                          className="inline-flex h-8 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors outline-none hover:border-foreground/40 focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none"
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
              {hasPokedex(region) && (
                <Link
                  {...pokedexLink}
                  className="flex h-11 shrink-0 items-center justify-between gap-3 rounded-lg border bg-card px-3.5 text-sm transition-colors outline-none hover:border-foreground/40 focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none"
                >
                  <span className="font-medium">Pokédex</span>
                  <span className="truncate text-muted-foreground">
                    Where to find every Pokémon
                  </span>
                </Link>
              )}
            </Block>

            <Block title="About this game" index={5}>
              <StatGrid stats={worldStats(stats)} />
              <DataLakeLink region={region} />
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
