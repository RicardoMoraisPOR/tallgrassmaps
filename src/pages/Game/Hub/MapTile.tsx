import { ArrowRight, Lock } from 'lucide-react';
import { Link } from 'react-router';

import { cn } from '@/lib/utils';

type MapTileProps = {
  name: string;
  image?: string;
  pixelated?: boolean;
  to?: string;
  font?: string;
  versionGroup?: string;
};

const frame =
  'group relative isolate block aspect-2/1 overflow-hidden bg-muted outline-none sm:aspect-3/1';

export const MapTile = ({
  name,
  image,
  pixelated,
  to,
  font,
  versionGroup,
}: MapTileProps) => {
  const isRby = versionGroup === 'RBY';
  const isZa = versionGroup === 'ZA';
  const look = isRby
    ? 'border-0'
    : isZa
      ? 'rounded-tr-[18px] rounded-bl-[18px] border-0'
      : 'rounded-sm border';
  const content = (
    <>
      {image ? (
        <img
          src={image}
          alt=""
          className={cn(
            'absolute inset-0 -z-10 size-full object-cover',
            pixelated && '[image-rendering:pixelated]',
            isZa && 'scale-110',
            !to && 'grayscale',
          )}
        />
      ) : (
        <Lock
          aria-hidden
          className="absolute top-1/2 right-6 size-6 -translate-y-1/2 text-muted-foreground"
        />
      )}
      <span
        aria-hidden
        className={cn(
          'absolute inset-0 -z-10',
          isZa
            ? 'bg-linear-to-t from-[rgb(10_53_102/0.95)] via-[rgb(10_53_102/0.3)] to-transparent'
            : 'bg-linear-to-t from-black/85 via-black/25 to-transparent',
        )}
      />
      {isRby && (
        <span
          aria-hidden
          className="absolute inset-0 shadow-[inset_0_0_0_3px_var(--gb-screen),inset_0_0_0_5px_var(--gb-ink)]"
        />
      )}
      {isZa && (
        <>
          <span
            aria-hidden
            className={cn(
              'absolute inset-0 rounded-tr-[18px] rounded-bl-[18px] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.22)]',
            )}
          />
          <span
            aria-hidden
            className="absolute inset-y-0 left-0 w-[3px] bg-[var(--za-green)]"
          />
        </>
      )}
      <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-4 sm:p-5">
        <span
          style={font ? { fontFamily: font } : undefined}
          className={cn(
            'flex items-center',
            font
              ? 'text-xl leading-tight uppercase sm:text-3xl'
              : 'font-heading text-4xl leading-[0.9] font-bold tracking-[-0.03em] sm:text-6xl',
            image ? 'text-white' : 'text-foreground',
          )}
        >
          {to && (isRby || isZa) && (
            <svg
              aria-hidden
              viewBox="0 0 4 7"
              shapeRendering={isRby ? 'crispEdges' : undefined}
              className="mr-0 h-5 w-0 flex-none opacity-0 transition-[width,margin,opacity] duration-300 group-hover:mr-3 group-hover:w-[11px] group-hover:opacity-100 group-focus-visible:mr-3 group-focus-visible:w-[11px] group-focus-visible:opacity-100 motion-reduce:transition-none sm:h-7 sm:group-hover:w-4 sm:group-focus-visible:w-4"
            >
              {isRby ? (
                <path
                  d="M0 0h1v7h-1zM1 1h1v5h-1zM2 2h1v3h-1zM3 3h1v1h-1z"
                  fill="currentColor"
                />
              ) : (
                <path d="M0 0L4 3.5L0 7z" fill="var(--za-green)" />
              )}
            </svg>
          )}
          {to && !isRby && !isZa && (
            <ArrowRight
              aria-hidden
              className="size-8 w-0 flex-none opacity-0 transition-[width,margin,opacity] duration-300 group-hover:mr-3 group-hover:w-8 group-hover:opacity-100 group-focus-visible:mr-3 group-focus-visible:w-8 group-focus-visible:opacity-100 motion-reduce:transition-none sm:size-12 sm:group-hover:w-12 sm:group-focus-visible:w-12"
            />
          )}
          {name}
        </span>
        {!to && (
          <span className="inline-flex h-7 flex-none items-center gap-1.5 rounded-full border border-white/40 bg-black/40 px-3 text-xs font-medium text-white">
            <Lock aria-hidden className="size-3" />
            Coming soon
          </span>
        )}
      </span>
    </>
  );

  const tile = to ? (
    <Link
      to={to}
      className={cn(
        frame,
        isZa && 'pokedex-za',
        look,
        isZa
          ? 'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--za-green)]'
          : 'focus-visible:ring-[3px] focus-visible:ring-ring/50',
      )}
    >
      {content}
    </Link>
  ) : (
    <div
      aria-disabled="true"
      className={cn(
        frame,
        isZa && 'pokedex-za',
        look,
        'cursor-not-allowed',
        !image && 'border-dashed',
      )}
    >
      {content}
    </div>
  );

  if (isRby) return <div className="pokedex-game gb-frame m-2">{tile}</div>;

  return tile;
};
