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
import { ENTER, enterDelay } from '@/lib/enter';
import { cn, formatList } from '@/lib/utils';

import { RelatedGames } from '../Region/GameSummary';
import { HubHeader } from './HubHeader';
import { MapTag } from './MapTag';
import { MapTile } from './MapTile';

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
          <ul className="flex flex-col gap-4">
            {cards.map(({ region, townMap }, index) => (
              <li
                key={region}
                className={ENTER}
                style={enterDelay(0.3 + index * 0.05)}
              >
                <MapTile
                  name={region}
                  image={townMap?.image}
                  pixelated={townMap && townMap.pixelated !== false}
                />
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
