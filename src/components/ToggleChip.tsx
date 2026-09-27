import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export const ToggleChip = ({
  pressed,
  title,
  onClick,
  children,
}: {
  pressed: boolean;
  title?: string;
  onClick: () => void;
  children: ReactNode;
}) => {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      title={title}
      onClick={onClick}
      className={cn(
        'group inline-flex h-9 items-center rounded-full border bg-background px-3 text-[13px] font-medium whitespace-nowrap transition-colors hover:border-foreground/30 hover:bg-muted sm:h-8 dark:bg-input/30 dark:hover:bg-input/70',
        pressed &&
          'border-foreground bg-foreground text-background hover:border-foreground hover:bg-foreground/85 dark:bg-foreground dark:hover:bg-foreground/85',
        'pokedex-game:h-8 pokedex-game:gap-2 pokedex-game:rounded-none pokedex-game:border-0 pokedex-game:bg-transparent pokedex-game:px-1.5 pokedex-game:text-[10px] pokedex-game:text-foreground pokedex-game:hover:bg-muted',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'hidden pokedex-game:inline-block',
          pressed ? 'gb-bullet' : 'gb-bullet-empty',
        )}
      />
      {children}
    </button>
  );
};
