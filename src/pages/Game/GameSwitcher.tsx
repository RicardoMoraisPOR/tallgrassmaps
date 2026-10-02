import { ChevronDown } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type Game, gamesSharingMap } from '@/data/games';

import { ColorDot } from './ColorDot';
import { switchHref } from './switchHref';

type GameSwitcherProps = {
  game: Game;
  path: string;
};

export const GameSwitcher = ({ game, path }: GameSwitcherProps) => {
  const navigate = useNavigate();
  const { search } = useLocation();

  const siblings = gamesSharingMap(game);

  const switchTo = (gameId: string) => {
    const target = siblings.find((other) => other.id === gameId);

    if (!target || target.id === game.id) return;

    navigate(switchHref(target, path, search));
  };

  if (siblings.length < 2) {
    return (
      <span className="flex items-center gap-2">
        <ColorDot color={game.colors[0]} />
        {game.shortName}
      </span>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`${game.fullName}, switch game`}
        className="group flex items-center gap-2 rounded-sm outline-offset-2 hover:text-foreground data-[state=open]:text-foreground"
      >
        <ColorDot color={game.colors[0]} />
        {game.shortName}
        <ChevronDown
          aria-hidden
          className="size-3.5 opacity-60 transition-transform group-data-[state=open]:rotate-180"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-52">
        <DropdownMenuLabel>Same map in</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={game.id} onValueChange={switchTo}>
          {siblings.map((other) => (
            <DropdownMenuRadioItem key={other.id} value={other.id}>
              <ColorDot color={other.colors[0]} />
              {other.shortName}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
