import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router';

import { type Game, gamesSharingMap, games } from '@/data/games';
import type { Region } from '@/data/maps';
import { gameHref } from '@/lib/paths';

import { dataLakeHref } from '../../DataLake/urlState';
import { ColorDot } from '../ColorDot';
import type { Stat } from './gameStats';

const outlineRow =
  'transition-colors outline-none hover:border-foreground/40 focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none';

export const StatGrid = ({ stats }: { stats: Array<Stat> }) => (
  <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
    {stats
      .filter((stat): stat is { label: string; value: number } =>
        Boolean(stat.value),
      )
      .map(({ label, value }) => (
        <div
          key={label}
          className="flex flex-col-reverse gap-0.5 border-t pt-3"
        >
          <dt className="text-xs text-muted-foreground">{label}</dt>
          <dd className="font-heading text-3xl leading-none font-bold tabular-nums">
            {value.toLocaleString('en')}
          </dd>
        </div>
      ))}
  </dl>
);

export const DataLakeLink = ({ region }: { region: Region }) => (
  <Link
    to={dataLakeHref(region.versionGroup)}
    className={`flex h-11 shrink-0 items-center justify-between gap-3 rounded-lg border bg-card px-3.5 text-sm ${outlineRow}`}
  >
    <span className="font-medium">Data Lake</span>
    <span className="truncate text-muted-foreground">
      Browse and filter all data
    </span>
  </Link>
);

const GameLinks = ({
  title,
  games: list,
  names,
  fallback,
}: {
  title: string;
  games: Array<Game>;
  names?: Array<string>;
  fallback?: string;
}) => (
  <div className="flex flex-col gap-2">
    <p className="text-xs text-muted-foreground">{title}</p>
    <ul className="flex flex-wrap gap-2">
      {list.map((other) => (
        <li key={other.id}>
          <Link
            to={gameHref(other.id)}
            className={`inline-flex h-8 items-center gap-2 rounded-lg border px-3 text-sm font-medium ${outlineRow}`}
          >
            <ColorDot color={other.colors[0]} />
            {other.fullName}
          </Link>
        </li>
      ))}
      {names?.map((name) => (
        <li
          key={name}
          className="inline-flex h-8 items-center rounded-lg border border-dashed px-3 text-sm text-muted-foreground"
        >
          {name}
        </li>
      ))}
      {list.length === 0 && !names && fallback && (
        <li className="text-sm font-medium">{fallback}</li>
      )}
    </ul>
  </div>
);

export const RelatedGames = ({ game }: { game: Game }) => {
  const siblings = gamesSharingMap(game).filter(
    (other) => other.id !== game.id,
  );
  const original = games.find((other) => other.fullName === game.remakeOf);
  const remakes = games.filter((other) => other.remakeOf === game.fullName);

  return (
    <>
      {siblings.length > 0 && (
        <GameLinks title="Same map in" games={siblings} />
      )}
      {game.remakeOf && (
        <GameLinks
          title="Remake of"
          games={original ? [original] : []}
          fallback={game.remakeOf}
        />
      )}
      {(remakes.length > 0 || game.remadeAs) && (
        <GameLinks title="Remade as" games={remakes} names={game.remadeAs} />
      )}
      <a
        href={`https://bulbapedia.bulbagarden.net/wiki/${encodeURIComponent(game.wiki)}`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex w-fit items-center gap-1.5 text-sm underline underline-offset-4 hover:text-muted-foreground"
      >
        {game.shortName} on Bulbapedia
        <ExternalLink aria-hidden className="size-3.5" />
      </a>
    </>
  );
};
