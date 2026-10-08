import { type ReactNode, useState } from 'react';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { m } from 'motion/react';

import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/stores/settings';

const DESKTOP_QUERY = '(min-width: 1024px)';

type GameAsideProps = {
  immersive: boolean;
  children: ReactNode;
};

export const GameAside = ({ immersive, children }: GameAsideProps) => {
  const [open, setOpen] = useState(
    () => window.matchMedia(DESKTOP_QUERY).matches,
  );
  const animations = useSettingsStore((state) => state.animations);
  const Icon = open ? ChevronRight : ChevronLeft;

  return (
    <m.aside
      layout={animations ? 'position' : false}
      aria-label="Cards"
      className={cn(
        immersive
          ? 'pointer-events-none absolute top-16 right-4 bottom-4 z-20 flex w-[360px] max-w-[calc(100%-2rem)] flex-col transition-[translate] duration-300 ease-out'
          : 'flex min-w-0 flex-col lg:relative lg:self-stretch',
        immersive && !open && 'translate-x-[calc(100%+1rem)]',
      )}
    >
      {immersive && (
        <button
          type="button"
          aria-expanded={open}
          aria-label={open ? 'Minimize cards' : 'Show cards'}
          onClick={() => setOpen((current) => !current)}
          className="pointer-events-auto absolute top-1/2 -left-9 flex h-14 w-8 -translate-y-1/2 items-center justify-center rounded-l-[14px] border border-r-0 bg-card text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <Icon aria-hidden className="size-4" />
        </button>
      )}
      <div
        inert={immersive && !open}
        className={cn(
          'flex min-h-0 flex-col gap-3',
          immersive
            ? 'pointer-events-auto max-h-full overflow-x-hidden overflow-y-auto overscroll-contain'
            : 'lg:absolute lg:inset-0 lg:overflow-x-hidden lg:overflow-y-auto',
        )}
      >
        {children}
      </div>
    </m.aside>
  );
};
