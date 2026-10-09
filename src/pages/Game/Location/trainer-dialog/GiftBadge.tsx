import { Trophy } from 'lucide-react';

import type { NpcGift } from '@/data/npcs/types';
import { cn } from '@/lib/utils';

export const GiftBadge = ({
  gift,
  gameTheme,
}: {
  gift: NpcGift;
  gameTheme: boolean;
}) => (
  <span
    title={`Gives you ${gift.name}`}
    aria-label={`Gives you ${gift.name}`}
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
    {gift.name}
  </span>
);
