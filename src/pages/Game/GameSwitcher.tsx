import { ChevronDown } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  entriesSharingMap,
  entryName,
  entryShortName,
} from '@/data/catalog/entries';
import type { CatalogEntry } from '@/data/catalog/types';
import { getGame } from '@/data/games';
import { useGameRoute } from '@/hooks/useGameRoute';
import { gameHref } from '@/lib/paths';

import { ColorDot } from './ColorDot';
import { switchHref } from './switchHref';

type GameSwitcherProps = {
  game: CatalogEntry;
  path: string;
};

export const GameSwitcher = ({ game, path }: GameSwitcherProps) => {
  const navigate = useNavigate();
  const route = useGameRoute();
  const { search } = useLocation();

  const siblings = entriesSharingMap(game);
  const hub = route ? route.hub : true;

  const select = (gameId: string) => {
    if (gameId === game.id) {
      if (!hub) navigate(gameHref(game.id));

      return;
    }

    const playable = getGame(gameId);

    navigate(
      playable ? switchHref(playable, path, search, hub) : gameHref(gameId),
    );
  };

  const label = (
    <>
      <ColorDot color={game.colors[0]} />
      {entryShortName(game)}
    </>
  );
  const name = hub ? (
    <span className="flex items-center gap-2">{label}</span>
  ) : (
    <Link
      to={gameHref(game.id)}
      aria-label={`${entryName(game)}, game page`}
      className="flex items-center gap-2 rounded-sm underline-offset-3 outline-offset-2 hover:text-foreground hover:underline"
    >
      {label}
    </Link>
  );

  if (siblings.length < 2) return name;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`${entryName(game)}, switch game`}
        className="group flex items-center gap-1 rounded-sm outline-offset-2 hover:text-foreground data-[state=open]:text-foreground"
      >
        <span className="flex items-center gap-2">{label}</span>
        <ChevronDown
          aria-hidden
          className="size-3.5 opacity-60 transition-transform group-data-[state=open]:rotate-180"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-52">
        <DropdownMenuLabel>Same map in</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={game.id}>
          {siblings.map((other) => (
            <DropdownMenuRadioItem
              key={other.id}
              value={other.id}
              onSelect={() => select(other.id)}
            >
              <ColorDot color={other.colors[0]} />
              {entryShortName(other)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
