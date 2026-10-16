import { Lock } from 'lucide-react';

import { Container } from '@/components/Container';
import {
  entriesSharingMap,
  entryOriginals,
  entryRemakes,
  generationOf,
} from '@/data/catalog/entries';
import { townMapFor } from '@/data/catalog/townMaps';
import type { UpcomingGame } from '@/data/catalog/types';
import { getCover } from '@/data/covers';
import { platformParts } from '@/data/games';
import { ENTER } from '@/lib/enter';
import { cn, formatList } from '@/lib/utils';

import { RelatedGames } from '../Region/GameSummary';
import { HubHeader } from './HubHeader';
import { MapTag } from './MapTag';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];

export const UpcomingPage = ({ game }: { game: UpcomingGame }) => {
  const cover = getCover(game.id);
  const generation = generationOf(game.id);
  const hasRelated =
    entriesSharingMap(game).length > 1 ||
    entryOriginals(game).length > 0 ||
    entryRemakes(game).length > 0;
  const cards = game.regions.flatMap((region, index) => {
    const townMap = townMapFor(game.versionGroup, region, game.id);
    const earlier = game.regions
      .slice(0, index)
      .some(
        (other) =>
          townMap &&
          townMapFor(game.versionGroup, other, game.id)?.image ===
            townMap.image,
      );

    return earlier
      ? []
      : [
          {
            region: townMap?.regions ? formatList(townMap.regions) : region,
            townMap,
          },
        ];
  });

  return (
    <Container size="wide" className="flex flex-col gap-12 pt-32 pb-20">
      <HubHeader cover={cover} title={game.title}>
        <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-sm text-muted-foreground sm:justify-start sm:text-left">
          <span className="font-semibold">
            {platformParts[game.platform].map(({ text, color }, index) => (
              <span key={index} style={color ? { color } : undefined}>
                {text}
              </span>
            ))}
          </span>
          {generation && (
            <>
              <span aria-hidden>·</span>
              <span>Generation {ROMAN[generation.number - 1]}</span>
            </>
          )}
          <span aria-hidden>·</span>
          <MapTag versionGroup={game.versionGroup} />
          <span aria-hidden>·</span>
          <span>{formatList(game.regions)}</span>
        </p>
      </HubHeader>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-12">
        <section className={cn('flex flex-col gap-4', ENTER)}>
          <h2 className="font-heading text-xl font-bold tracking-tight">
            Maps
          </h2>
          <ul className="grid gap-6 sm:grid-cols-2">
            {cards.map(({ region, townMap }) => (
              <li
                key={region}
                aria-disabled="true"
                className="flex cursor-not-allowed flex-col gap-4"
              >
                <span
                  className={cn(
                    'relative flex aspect-square items-center justify-center overflow-hidden rounded-xl border bg-muted/45',
                    !townMap && 'border-dashed',
                  )}
                >
                  {townMap ? (
                    <>
                      <img
                        src={townMap.image}
                        alt=""
                        className={cn(
                          'size-full object-cover',
                          townMap.pixelated !== false &&
                            '[image-rendering:pixelated]',
                        )}
                      />
                      <span
                        aria-hidden
                        className="absolute inset-0 bg-black/30"
                      />
                    </>
                  ) : (
                    <Lock
                      aria-hidden
                      className="size-6 text-muted-foreground"
                    />
                  )}
                </span>
                <span className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <span className="font-heading text-3xl font-bold tracking-tight">
                    {region}
                  </span>
                  <span className="inline-flex h-6 items-center gap-1 rounded-full border bg-muted/50 px-2.5 text-xs font-medium text-muted-foreground">
                    <Lock aria-hidden className="size-3" />
                    Coming soon
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
        {hasRelated && (
          <section className={cn('flex flex-col gap-4', ENTER)}>
            <h2 className="font-heading text-xl font-bold tracking-tight">
              Related
            </h2>
            <RelatedGames game={game} />
          </section>
        )}
      </div>
    </Container>
  );
};
