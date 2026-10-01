import type { NpcGift } from '@/data/npcs/types';
import { cn } from '@/lib/utils';

export const GiftBox = ({
  gift,
  gameTheme,
}: {
  gift: NpcGift;
  gameTheme: boolean;
}) => {
  const label = gift.count ? `${gift.name} ×${gift.count}` : gift.name;

  return (
    <div className="flex justify-center">
      <div
        aria-label={`Gift: ${label}`}
        className={cn(
          'flex items-center gap-1 py-0.5 pr-2 pl-0.5',
          gameTheme
            ? 'border-2 border-(--gb-ink) text-[8px] leading-none'
            : 'rounded-md border border-border bg-muted/60 text-xs font-medium',
        )}
      >
        <img
          src={gift.sprite}
          alt=""
          className="size-6 object-cover object-top pixelated"
        />
        {label}
      </div>
    </div>
  );
};
