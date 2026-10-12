import type { CSSProperties } from 'react';

import { ChevronDown, X } from 'lucide-react';
import { AnimatePresence, m } from 'motion/react';

import { ToggleChip } from '@/components/ToggleChip';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
  type FilterGroup,
  type FilterKey,
  type FilterOption,
  type Filters,
  filterGroups,
} from './filters';

const chipMotion = {
  initial: { opacity: 0, scale: 0.94 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.94 },
  transition: { duration: 0.15, ease: 'easeOut' },
} as const;

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
  const selected = filterGroups.flatMap(({ key, options }) =>
    options
      .filter((option) => filters[key].includes(option.value))
      .map((option) => ({ key, option })),
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {filterGroups.map((group) => (
          <FilterDropdown
            key={group.key}
            group={group}
            values={filters[group.key]}
            onToggle={(value) => onToggle(group.key, value)}
          />
        ))}
      </div>
      <div
        aria-live="polite"
        className="flex min-h-9 flex-wrap items-center gap-1.5 text-[13px] text-muted-foreground"
      >
        <AnimatePresence initial={false} mode="popLayout">
          {selected.map(({ key, option }) => (
            <m.span
              key={`${key}-${option.value}`}
              layout
              {...chipMotion}
              className="inline-flex"
            >
              <ToggleChip
                pressed
                title={option.title}
                onClick={() => onToggle(key, option.value)}
              >
                <span className="flex items-center gap-1.5">
                  <FilterLabel option={option} tone="pressed" />
                  <X aria-hidden className="size-3.5 opacity-70" />
                  <span className="sr-only">, remove filter</span>
                </span>
              </ToggleChip>
            </m.span>
          ))}
        </AnimatePresence>
        {active && (
          <m.span
            layout
            transition={chipMotion.transition}
            className="flex h-9 items-center gap-3 pl-1.5"
          >
            Showing {shown} of {total} games
            <button
              type="button"
              onClick={onClear}
              className="inline-flex h-8 items-center gap-1 rounded-full px-2.5 font-medium text-foreground transition-colors hover:bg-muted"
            >
              <X className="size-3.5" />
              Clear filters
            </button>
          </m.span>
        )}
      </div>
    </div>
  );
};

type FilterDropdownProps = {
  group: FilterGroup;
  values: Array<string>;
  onToggle: (value: string) => void;
};

const FilterDropdown = ({ group, values, onToggle }: FilterDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="group inline-flex h-9 items-center gap-2 rounded-full border bg-background px-3.5 text-[13px] font-medium whitespace-nowrap transition-colors outline-none hover:border-foreground/30 hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[state=open]:border-foreground/30 sm:h-8 dark:bg-input/30 dark:hover:bg-input/70">
        {group.label}
        {values.length > 0 && (
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1.5 text-[11px] leading-none text-background tabular-nums">
            {values.length}
            <span className="sr-only"> selected</span>
          </span>
        )}
        <ChevronDown
          aria-hidden
          className="size-3.5 opacity-60 transition-transform group-data-[state=open]:rotate-180"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="max-h-[min(24rem,var(--radix-dropdown-menu-content-available-height))] min-w-48"
      >
        {group.options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={values.includes(option.value)}
            title={option.title}
            onCheckedChange={() => onToggle(option.value)}
            onSelect={(event) => event.preventDefault()}
            className="group/option"
          >
            <FilterLabel option={option} tone="menu" />
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const letterClass = {
  pressed: 'version-letter',
  menu: 'group-data-[state=checked]/option:version-letter-surface',
};

const FilterLabel = ({
  option,
  tone,
}: {
  option: FilterOption;
  tone: keyof typeof letterClass;
}) => {
  if (!option.parts) return <span>{option.label}</span>;

  return (
    <span>
      {option.parts.map(({ text, color }, index) =>
        color ? (
          <span
            key={index}
            className={letterClass[tone]}
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
