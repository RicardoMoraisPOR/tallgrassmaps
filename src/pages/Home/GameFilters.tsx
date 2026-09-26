import type { CSSProperties, ReactNode } from 'react';

import { X } from 'lucide-react';

import { cn } from '@/lib/utils';

import {
  type FilterKey,
  type FilterOption,
  type Filters,
  filterGroups,
} from './filters';

type GameFiltersProps = {
  filters: Filters;
  active: boolean;
  shown: number;
  total: number;
  onToggle: (key: FilterKey, value: string) => void;
  onClear: () => void;
};

export const GameFilters = ({
  filters,
  active,
  shown,
  total,
  onToggle,
  onClear,
}: GameFiltersProps) => {
  return (
    <div className="flex flex-col gap-3">
      {filterGroups.map(({ key, label, options }) => (
        <div
          key={key}
          className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4"
        >
          <span className="w-16 flex-none text-xs font-medium tracking-wider text-muted-foreground uppercase sm:pt-2">
            {label}
          </span>
          <div
            role="group"
            aria-label={label}
            className="flex flex-wrap gap-1.5"
          >
            {options.map((option) => (
              <FilterChip
                key={option.value}
                pressed={filters[key].includes(option.value)}
                title={option.title}
                onClick={() => onToggle(key, option.value)}
              >
                <ChipLabel option={option} />
              </FilterChip>
            ))}
          </div>
        </div>
      ))}
      <div
        aria-live="polite"
        className="text-[13px] text-muted-foreground empty:hidden sm:pl-20"
      >
        {active && (
          <div className="flex min-h-9 items-center gap-3">
            Showing {shown} of {total} games
            <button
              type="button"
              onClick={onClear}
              className="inline-flex h-8 items-center gap-1 rounded-full px-2.5 font-medium text-foreground transition-colors hover:bg-muted"
            >
              <X className="size-3.5" />
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const FilterChip = ({
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
      )}
    >
      {children}
    </button>
  );
};

const ChipLabel = ({ option }: { option: FilterOption }) => {
  if (!option.parts) return option.label;

  return (
    <span>
      {option.parts.map(({ text, color }, index) =>
        color ? (
          <span
            key={index}
            className="group-aria-pressed:version-letter"
            style={{ '--letter': color } as CSSProperties}
          >
            {text}
          </span>
        ) : (
          <span key={index}>{text}</span>
        ),
      )}
    </span>
  );
};
