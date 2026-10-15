import { type ReactNode, useMemo, useState } from 'react';

import {
  Backpack,
  Calendar,
  Code,
  ExternalLink,
  Gamepad2,
  Gift,
  ListChecks,
  MapPin,
  Signpost,
  Swords,
  Users,
} from 'lucide-react';
import { Link } from 'react-router';

import { ColorStripe, Cover } from '@/components/GameCover';
import { Button } from '@/components/ui/button';
import {
  versionGroupNames,
  versionGroupParts,
} from '@/data/catalog/versionGroups';
import { platformParts, type Game } from '@/data/games';
import type { Region } from '@/data/maps';
import { cn, formatList } from '@/lib/utils';

import { dataLakeHref } from '../../DataLake/urlState';
import { extrasFor } from '../Extras/extras';
import { ExtrasDialog } from '../Extras/ExtrasDialog';
import type { GameExtra } from '../Extras/types';
import { gameStats } from './gameStats';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];

const dateFormat = new Intl.DateTimeFormat('en', { dateStyle: 'long' });

type GameInfoCardProps = {
  game: Game;
  region: Region;
};

export const GameInfoCard = ({ game, region }: GameInfoCardProps) => {
  const stats = useMemo(() => gameStats(game, region), [game, region]);
  const [extra, setExtra] = useState<GameExtra>();

  const extras = extrasFor(region.versionGroup) ?? [];

  const pokemon = [
    { label: 'In the Pokédex', value: stats.pokedexSize },
    {
      label: `In ${game.shortName} without ${game.obtainableExcluding ?? 'trading'}`,
      value: stats.obtainableWithoutTrading,
    },
    {
      label: `Only in ${game.shortName}`,
      value: stats.versionExclusives,
    },
    { label: 'Found in the wild', value: stats.wildSpecies },
    { label: 'Mega Evolutions', value: stats.megaEvolutions },
  ].filter((stat): stat is { label: string; value: number } =>
    Boolean(stat.value),
  );

  const world = [
    {
      icon: Backpack,
      label: 'Items',
      value: stats.items?.total,
      detail: stats.items?.hidden ? `${stats.items.hidden} hidden` : undefined,
    },
    { icon: Swords, label: 'Trainer battles', value: stats.trainers },
    { icon: Users, label: 'People to talk to', value: stats.npcs },
    { icon: Signpost, label: 'Signs', value: stats.signs },
    { icon: Gift, label: 'Gift & static Pokémon', value: stats.staticPokemon },
    { icon: MapPin, label: 'Mapped places', value: stats.places },
  ].filter((row) => row.value);

  return (
    <section
      aria-labelledby="game-heading"
      className="flex min-h-0 flex-1 flex-col overflow-hidden overflow-y-auto rounded-xl border bg-card"
    >
      <ColorStripe colors={game.colors} />
      <Cover gameId={game.id} accent={game.colors[0]} aspect="aspect-16/7" />
      <div className="flex flex-col gap-5 p-5">
        <div className="flex flex-col gap-2">
          <h2
            id="game-heading"
            className="font-heading text-2xl leading-tight font-bold tracking-tight text-balance"
          >
            {game.fullName}
          </h2>
          <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
            <Gamepad2 aria-hidden className="size-4 flex-none" />
            <span className="font-medium">
              {platformParts[game.platform].map(({ text, color }, index) => (
                <span key={index} style={color ? { color } : undefined}>
                  {text}
                </span>
              ))}
            </span>
            <span aria-hidden>·</span>
            <span>
              Generation {ROMAN[game.generation - 1] ?? game.generation}
            </span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            <Tag>
              {game.remakeOf ? `Remake of ${game.remakeOf}` : 'Original game'}
            </Tag>
            <Tag>
              {region.navigation === 'seamless'
                ? region.name
                : `${region.name} region`}
            </Tag>
            <Tag
              title={`Same maps in ${formatList(versionGroupNames(region.versionGroup))}`}
            >
              {versionGroupParts(region.versionGroup).map(
                ({ text, color }, index) => (
                  <span key={index} style={color ? { color } : undefined}>
                    {text}
                  </span>
                ),
              )}
              &nbsp;map
            </Tag>
          </div>
        </div>

        <dl className="flex flex-col gap-2.5 text-xs">
          <Fact icon={Calendar} label="Released">
            <time dateTime={game.releaseDate}>
              {dateFormat.format(new Date(`${game.releaseDate}T00:00:00`))}
            </time>
          </Fact>
          <Fact icon={Code} label="Developer">
            {game.developer}
          </Fact>
        </dl>

        {extras.length > 0 && (
          <div className="flex flex-col gap-2">
            <SectionTitle>Guides</SectionTitle>
            {extras.map((entry) => (
              <Button
                key={entry.id}
                variant="outline"
                size="lg"
                className="w-full justify-between"
                onClick={() => setExtra(entry)}
              >
                <span className="flex items-center gap-2">
                  <ListChecks aria-hidden />
                  {entry.title}
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {entry.count}
                </span>
              </Button>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <SectionTitle>Pokémon</SectionTitle>
          <dl className="grid grid-cols-2 gap-2">
            {pokemon.map(({ label, value }) => (
              <div
                key={label}
                className="flex flex-col-reverse justify-end gap-0.5 rounded-lg bg-muted/60 px-3 py-2.5"
              >
                <dt className="text-xs leading-4 text-muted-foreground">
                  {label}
                </dt>
                <dd className="font-heading text-2xl font-bold tracking-tight tabular-nums">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {world.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-3">
              <SectionTitle>Stats</SectionTitle>
              <Link
                to={dataLakeHref(region.versionGroup)}
                className="text-xs text-muted-foreground underline underline-offset-3 hover:text-foreground"
              >
                Explore in Data Lake
              </Link>
            </div>
            <dl className="flex flex-col divide-y rounded-lg border">
              {world.map(({ icon: Icon, label, value, detail }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 px-3 py-2.5 text-xs"
                >
                  <Icon
                    aria-hidden
                    className="size-4 flex-none text-muted-foreground"
                  />
                  <dt className="flex-1">{label}</dt>
                  {detail && (
                    <span className="text-xs text-muted-foreground">
                      {detail}
                    </span>
                  )}
                  <dd className="font-heading font-bold tabular-nums">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Button variant="outline" size="lg" className="w-full" asChild>
            <a
              href={`https://bulbapedia.bulbagarden.net/wiki/${encodeURIComponent(game.wiki)}`}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink aria-hidden />
              {game.shortName} on Bulbapedia
            </a>
          </Button>
        </div>
      </div>
      <ExtrasDialog
        game={game}
        region={region}
        extra={extra}
        onOpenChange={(open) => !open && setExtra(undefined)}
      />
    </section>
  );
};

const SectionTitle = ({ children }: { children: ReactNode }) => (
  <h3 className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
    {children}
  </h3>
);

const Tag = ({ children, title }: { children: ReactNode; title?: string }) => (
  <span
    title={title}
    className={cn(
      'inline-flex h-6 items-center rounded-full border bg-muted/50 px-2.5 text-xs font-medium',
    )}
  >
    {children}
  </span>
);

const Fact = ({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Calendar;
  label: string;
  children: ReactNode;
}) => (
  <div className="flex items-center gap-3">
    <Icon aria-hidden className="size-4 flex-none text-muted-foreground" />
    <dt className="w-20 text-muted-foreground">{label}</dt>
    <dd className="font-medium">{children}</dd>
  </div>
);
