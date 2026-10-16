import { Check, ChevronDown } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { entryVersionGroup } from '@/data/catalog/entries';
import { mapSets } from '@/data/catalog/mapSets';
import type { CatalogEntry, MapSet } from '@/data/catalog/types';
import { getGame } from '@/data/games';
import { useGameRoute } from '@/hooks/useGameRoute';
import { gameHref } from '@/lib/paths';
import { formatList } from '@/lib/utils';

import { ColorDot } from './ColorDot';
import { switchHref } from './switchHref';

type MapSwitcherProps = {
  game: CatalogEntry;
  path: string;
};

export const MapSwitcher = ({ game, path }: MapSwitcherProps) => {
  const navigate = useNavigate();
  const route = useGameRoute();
  const { search } = useLocation();

  const current = entryVersionGroup(game);

  const openGame = (gameId: string) => {
    if (gameId === game.id) return;

    const target = getGame(gameId);

    navigate(
      target
        ? switchHref(target, path, search, route ? route.hub : true)
        : gameHref(gameId),
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`${current} map, switch map`}
        className="group flex items-center gap-1.5 rounded-sm outline-offset-2 hover:text-foreground data-[state=open]:text-foreground"
      >
        {current} map
        <ChevronDown
          aria-hidden
          className="size-3.5 opacity-60 transition-transform group-data-[state=open]:rotate-180"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Maps</DropdownMenuLabel>
        {mapSets.map((set) => (
          <DropdownMenuSub key={set.versionGroup}>
            <DropdownMenuSubTrigger>
              <MapSetLabel set={set} />
              {set.versionGroup === current && (
                <Check aria-label="Current map" className="size-3.5" />
              )}
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="min-w-48">
                {set.games.map((option) => (
                  <DropdownMenuItem
                    key={option.id}
                    onSelect={() => openGame(option.id)}
                  >
                    <ColorDot color={option.color} />
                    <span className="flex-1">{option.name}</span>
                    {option.id === game.id && (
                      <Check aria-label="Current game" className="size-3.5" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const MapSetLabel = ({ set }: { set: MapSet }) => {
  return (
    <span className="flex flex-1 items-baseline gap-2">
      <span className="font-medium">{set.versionGroup}</span>
      <span className="text-xs text-muted-foreground">
        {formatList(set.regions)}
      </span>
    </span>
  );
};
