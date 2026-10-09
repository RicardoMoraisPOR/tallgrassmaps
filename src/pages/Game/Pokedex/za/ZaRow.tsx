import { useEffect, useRef } from 'react';

import { m } from 'motion/react';

import { usePokemonSprite } from '@/hooks/usePokemonSprite';
import { cn } from '@/lib/utils';

import { isObtainable } from '../entryDetails';
import type { PokedexRowProps } from '../types';
import { ZaBall } from './ZaBall';

export const ZaRow = ({
  entry,
  game,
  selected = false,
  focused = false,
  onSelect,
}: PokedexRowProps) => {
  const rowRef = useRef<HTMLLIElement>(null);
  const spriteFor = usePokemonSprite(game);

  const sprite = spriteFor(entry.number);
  const obtainable = isObtainable(entry, game);

  useEffect(() => {
    if (focused) rowRef.current?.scrollIntoView({ block: 'center' });
  }, [focused]);

  return (
    <li ref={rowRef} className="relative">
      {selected && (
        <m.span
          aria-hidden
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 700, damping: 18 }}
          className="absolute -top-2 left-1/2 z-10 h-3 w-6 -translate-x-1/2 bg-(--za-green) [clip-path:polygon(0_0,100%_0,50%_100%)]"
        />
      )}
      <button
        type="button"
        aria-pressed={selected}
        aria-label={`${entry.name}, number ${entry.id}`}
        onClick={onSelect}
        className={cn(
          'flex w-full flex-col items-center gap-0.5 rounded-lg bg-(--za-tile) p-1.5 text-white transition-colors outline-none hover:bg-(--za-tile-hover) focus-visible:ring-2 focus-visible:ring-(--za-green)',
          selected && 'bg-white text-(--za-deep) hover:bg-white',
        )}
      >
        <img
          src={sprite.src}
          alt=""
          width={96}
          height={96}
          loading="lazy"
          className={cn(
            'aspect-square w-full rounded-md object-contain',
            sprite.pixelated && 'pixelated',
          )}
        />
        <span className="flex items-center gap-1 text-sm font-bold tabular-nums">
          <ZaBall caught={obtainable} className="size-3.5" />
          {String(entry.id).padStart(3, '0')}
        </span>
      </button>
    </li>
  );
};
