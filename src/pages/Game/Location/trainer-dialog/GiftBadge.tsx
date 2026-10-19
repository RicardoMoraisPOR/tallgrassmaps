import { Trophy } from 'lucide-react';

import { itemDetails } from '@/data/items/details';
import type { NpcGift } from '@/data/npcs/types';
import { cn } from '@/lib/utils';

export const GiftBadge = ({
  gift,
  gameTheme,
}: {
  gift: NpcGift;
  gameTheme: boolean;
}) => {
  const { moveName } = itemDetails(gift.name);
  const label = moveName ? `${gift.name} ${moveName}` : gift.name;

  return (
    <span
      title={`Gives you ${label}`}
      aria-label={`Gives you ${label}`}
      className={cn(
        'inline-flex shrink-0 items-center gap-1 whitespace-nowrap',
        gameTheme ? 'text-[8px] leading-none' : 'text-xs font-medium',
      )}
    >
      {!gameTheme && (
        <Trophy
          aria-hidden
          className="size-3.5 text-amber-600 dark:text-amber-400"
        />
      )}
      <img
        src={gift.sprite}
        alt=""
        className="size-4 object-cover object-top pixelated"
      />
      {label}
    </span>
  );
};
