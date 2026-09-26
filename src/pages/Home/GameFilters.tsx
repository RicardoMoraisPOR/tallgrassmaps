import type { CSSProperties } from 'react';

import { X } from 'lucide-react';

import { ToggleChip } from '@/components/ToggleChip';

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
              <ToggleChip
                key={option.value}
                pressed={filters[key].includes(option.value)}
                title={option.title}
                onClick={() => onToggle(key, option.value)}
              >
                <ChipLabel option={option} />
              </ToggleChip>
            ))}
          </div>
        </div>
      ))}
      <div
        aria-live="polite"
        className="min-h-9 text-[13px] text-muted-foreground sm:pl-20"
      >
        {active && (
          <div className="flex h-9 items-center gap-3">
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
