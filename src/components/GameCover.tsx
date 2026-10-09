import type { ReactNode } from 'react';

import { getCover } from '@/data/covers';
import { cn } from '@/lib/utils';

export const ColorStripe = ({
  colors,
  className,
}: {
  colors: Array<string>;
  className?: string;
}) => {
  return (
    <div className={cn('flex h-1 flex-none', className)}>
      {colors.map((color) => (
        <span key={color} className="flex-1" style={{ background: color }} />
      ))}
    </div>
  );
};

export const Cover = ({
  gameId,
  accent,
  interactive = false,
  muted = false,
  aspect = 'aspect-16/10',
  children,
}: {
  gameId: string;
  accent: string;
  interactive?: boolean;
  muted?: boolean;
  aspect?: string;
  children?: ReactNode;
}) => {
  const cover = getCover(gameId);

  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden border-b bg-muted',
        aspect,
        muted && 'border-dashed',
      )}
    >
      {cover ? (
        <div className={cn('absolute inset-0', muted && 'opacity-70')}>
          <img
            src={cover}
            alt=""
            aria-hidden
            className="absolute inset-0 size-full scale-125 object-cover opacity-60 blur-xl"
          />
          <img
            src={cover}
            alt=""
            loading="lazy"
            className={cn(
              'relative mx-auto h-full object-contain py-3 drop-shadow-[0_6px_14px_oklch(0_0_0/0.35)]',
              interactive &&
                'transition-transform duration-420 ease-[cubic-bezier(.2,.8,.2,1)] group-hover/card:scale-106 group-focus-visible/card:scale-106',
            )}
          />
        </div>
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center px-4 text-center text-xs text-muted-foreground"
          style={{
            background: `color-mix(in oklch, ${accent} 18%, var(--muted))`,
          }}
        >
          No cover yet
        </div>
      )}
      {children}
    </div>
  );
};
