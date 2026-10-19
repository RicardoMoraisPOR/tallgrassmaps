import { Search, X } from 'lucide-react';

import { cn } from '@/lib/utils';

type FindBannerProps = {
  query: string;
  count: number;
  onClear: () => void;
};

export const FindBanner = ({ query, count, onClear }: FindBannerProps) => (
  <div className="pointer-events-none absolute inset-x-14 top-[137px] z-10 flex justify-center md:top-[73px]">
    <div
      role="status"
      className={cn(
        'pointer-events-auto flex max-w-full items-center gap-2 rounded-sm border bg-card/90 py-1 pr-1 pl-3 text-xs shadow-sm',
      )}
    >
      <Search
        aria-hidden
        className="size-3.5 flex-none text-muted-foreground"
      />
      <span className="min-w-0 truncate">
        Showing <span className="font-semibold">{query}</span>
        <span className="text-muted-foreground">
          {' '}
          · {count} {count === 1 ? 'result' : 'results'}
        </span>
      </span>
      <button
        type="button"
        aria-label="Clear search on map"
        onClick={onClear}
        className="flex size-6 flex-none items-center justify-center rounded-sm outline-none hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <X aria-hidden className="size-3.5" />
      </button>
    </div>
  </div>
);
