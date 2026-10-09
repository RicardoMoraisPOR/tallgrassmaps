import type { ComponentType } from 'react';

import { Search, X } from 'lucide-react';

import { ToggleChip } from '@/components/ToggleChip';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
} from '@/components/ui/drawer';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { DESKTOP_QUERY } from '@/lib/breakpoints';
import { cn } from '@/lib/utils';

import type {
  PokedexDrawerProps,
  PokedexListProps,
  PokedexProps,
  PokedexRowProps,
  PokedexSearchProps,
  PokedexTitleProps,
} from './types';

export type ListSkin = {
  Title: ComponentType<PokedexTitleProps>;
  Row: ComponentType<PokedexRowProps>;
  drawerClassName?: string;
  searchClassName: string;
  searchIconClassName: string;
  filtersClassName?: string;
  listClassName: string;
};

type Skinned<Props> = Props & { skin: ListSkin };

export const PokedexList = ({
  Row,
  className,
  emptyClassName,
  entries,
  focus,
  selectedNumber,
  onSelectNumber,
  ...context
}: PokedexListProps & {
  Row: ComponentType<PokedexRowProps>;
  className: string;
  emptyClassName: string;
}) => (
  <>
    <ul aria-label="Pokémon" className={className}>
      {entries.map((entry) => (
        <Row
          key={entry.id}
          {...context}
          entry={entry}
          focused={entry.number === focus}
          selected={entry.number === selectedNumber}
          onSelect={onSelectNumber && (() => onSelectNumber(entry.number))}
        />
      ))}
    </ul>
    {entries.length === 0 && (
      <p className={emptyClassName}>No Pokémon match these filters.</p>
    )}
  </>
);

export const ListDrawer = ({
  skin,
  open,
  onClose,
  header,
  children,
}: Skinned<PokedexDrawerProps>) => {
  const wide = useMediaQuery(DESKTOP_QUERY);

  return (
    <Drawer
      open={open}
      onOpenChange={(next) => !next && onClose()}
      direction={wide ? 'right' : 'bottom'}
      handleOnly={wide}
    >
      <DrawerContent
        className={cn(
          'select-text!',
          skin.drawerClassName,
          'data-[vaul-drawer-direction=bottom]:h-[85svh] data-[vaul-drawer-direction=bottom]:max-h-[85svh] data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-md',
        )}
      >
        <DrawerHeader className="relative">
          {header}
          <DrawerClose asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Close Pokédex"
              className="absolute top-3 right-3"
            >
              <X aria-hidden />
            </Button>
          </DrawerClose>
        </DrawerHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export const ListSearch = ({ skin, search }: Skinned<PokedexSearchProps>) => (
  <div
    data-pokedex-header
    className="sticky top-0 z-10 flex flex-col gap-2.5 bg-popover pb-3"
  >
    <label className={skin.searchClassName}>
      <Search
        aria-hidden
        className={cn('size-4 flex-none', skin.searchIconClassName)}
      />
      <span className="sr-only">Search the Pokédex</span>
      <input
        type="search"
        value={search.query}
        onChange={(event) => search.setQuery(event.target.value)}
        placeholder="Search by name or number…"
        className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </label>
    {search.filters.length > 0 && (
      <div
        role="group"
        aria-label="Filters"
        className={cn('flex flex-wrap gap-1.5', skin.filtersClassName)}
      >
        {search.filters.map(({ id, label }) => (
          <ToggleChip
            key={id}
            pressed={search.selected.includes(id)}
            onClick={() => search.toggle(id)}
          >
            {label}
          </ToggleChip>
        ))}
      </div>
    )}
    <p aria-live="polite" className="text-xs text-muted-foreground">
      {search.visible.length === search.total
        ? `${search.total} Pokémon`
        : `Showing ${search.visible.length} of ${search.total} Pokémon`}
    </p>
  </div>
);

export const ListPokedexList = ({
  skin,
  ...props
}: Skinned<PokedexListProps>) => (
  <PokedexList
    {...props}
    Row={skin.Row}
    className={skin.listClassName}
    emptyClassName="py-8 text-center text-sm text-muted-foreground"
  />
);

export const ListPokedex = ({
  skin,
  game,
  region,
  href,
  nameOf,
  open,
  focus,
  onClose,
  search,
}: Skinned<PokedexProps>) => (
  <ListDrawer
    skin={skin}
    open={open}
    onClose={onClose}
    header={<skin.Title game={game} region={region} />}
  >
    <div className="flex flex-col gap-3">
      <ListSearch skin={skin} search={search} />
      <ListPokedexList
        skin={skin}
        game={game}
        region={region}
        href={href}
        nameOf={nameOf}
        entries={search.visible}
        focus={focus}
      />
    </div>
  </ListDrawer>
);
