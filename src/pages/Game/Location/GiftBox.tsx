import { useState } from 'react';

import { ChevronDown } from 'lucide-react';

import { Collapse } from '@/components/Collapse';
import { itemDetails } from '@/data/items/details';
import type { NpcGift } from '@/data/npcs/types';
import { cn } from '@/lib/utils';

import { PokemonTypeTags } from '../Pokedex/PokemonTypeTags';

export const GiftBox = ({
  gift,
  gameTheme,
}: {
  gift: NpcGift;
  gameTheme: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const label = gift.count ? `${gift.name} ×${gift.count}` : gift.name;
  const { effect, moveName, moveType } = itemDetails(gift.name);
  const expandable = Boolean(effect || moveName);

  const content = (
    <>
      <img
        src={gift.sprite}
        alt=""
        className="size-6 object-cover object-top pixelated"
      />
      {label}
      {expandable &&
        (gameTheme ? (
          <span
            aria-hidden
            className={cn(
              'ml-1 inline-block border-x-[3px] border-x-transparent border-t-[5px] border-t-(--gb-ink) transition-transform duration-150 motion-reduce:transition-none',
              open && 'rotate-180',
            )}
          />
        ) : (
          <ChevronDown
            aria-hidden
            className={cn(
              'ml-0.5 size-3.5 text-muted-foreground transition-transform duration-150 motion-reduce:transition-none',
              open && 'rotate-180',
            )}
          />
        ))}
    </>
  );

  const boxClass = cn(
    'flex items-center gap-1 py-0.5 pr-2 pl-0.5',
    gameTheme
      ? 'border-2 border-(--gb-ink) text-[8px] leading-none'
      : 'rounded-sm border border-border bg-muted/60 text-xs font-medium',
  );

  return (
    <div className="flex flex-col items-center">
      {expandable ? (
        <button
          type="button"
          aria-expanded={open}
          aria-label={`Gift: ${label}. ${open ? 'Hide' : 'Show'} details`}
          onClick={() => setOpen((current) => !current)}
          className={cn(
            boxClass,
            'cursor-pointer outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
            !gameTheme && 'hover:bg-muted',
          )}
        >
          {content}
        </button>
      ) : (
        <div aria-label={`Gift: ${label}`} className={boxClass}>
          {content}
        </div>
      )}
      {expandable && (
        <Collapse open={open} className="w-full pt-1.5">
          <div
            className={cn(
              'flex flex-col items-start gap-1.5',
              gameTheme
                ? 'border-2 border-dashed border-(--gb-ink) px-2 py-1.5 text-[8px] leading-[12px]'
                : 'rounded-sm bg-muted px-2.5 py-2 text-xs',
            )}
          >
            {moveName && (
              <span
                className={cn(
                  gameTheme ? 'text-[10px] leading-[14px]' : 'font-medium',
                )}
              >
                {moveName}
              </span>
            )}
            {moveType && <PokemonTypeTags types={[moveType]} />}
            {effect && (
              <p className={cn(!gameTheme && 'text-muted-foreground')}>
                {effect}
              </p>
            )}
          </div>
        </Collapse>
      )}
    </div>
  );
};
