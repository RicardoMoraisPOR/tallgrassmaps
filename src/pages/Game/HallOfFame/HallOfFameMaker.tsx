import { useState } from 'react';

import { ChevronDown } from 'lucide-react';

import { useThemeStyle } from '@/components/settings/themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type Game, games, getGame } from '@/data/games';
import { getRegion } from '@/data/maps';
import { pokedexFor } from '@/data/pokedex';
import { cn } from '@/lib/utils';

import { ColorDot } from '../ColorDot';
import { emptyTeam, hasHallOfFame, type Team } from './hallOfFame';
import { HallOfFameDialog } from './HallOfFameDialog';

const pokedexForGame = (game: Game) => {
  const versionGroup = getRegion(game.region)?.versionGroup;

  return versionGroup ? pokedexFor(versionGroup) : undefined;
};

const pickableGames = games.filter(
  (game) => hasHallOfFame(game) && pokedexForGame(game),
);

type HallOfFameMakerProps = {
  open: boolean;
  onClose: () => void;
};

export const HallOfFameMaker = ({ open, onClose }: HallOfFameMakerProps) => {
  const prefersGameTheme = useThemeStyle('hallOfFame') === 'game';
  const [gameId, setGameId] = useState<string>();
  const [team, setTeam] = useState<Team>(emptyTeam);

  const game = getGame(gameId);
  const pokedex = game && pokedexForGame(game);
  const gameTheme =
    game !== undefined && hasHallOfFame(game) && prefersGameTheme;

  const pickGame = (id: string) => {
    if (id === gameId || !getGame(id)) return;

    setGameId(id);
    setTeam(emptyTeam());
  };

  return (
    <HallOfFameDialog
      open={open}
      game={game}
      pokedex={pokedex}
      team={team}
      onTeamChange={setTeam}
      onClose={onClose}
      gamePicker={
        <div
          className={cn(
            'flex items-center gap-3',
            gameTheme ? 'px-2 text-[8px] leading-none' : 'text-sm',
          )}
        >
          <span className={cn(!gameTheme && 'text-muted-foreground')}>
            Game
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {gameTheme ? (
                <button
                  type="button"
                  className="flex cursor-pointer items-center gap-2 border-2 border-(--gb-ink) px-3 py-2 text-[8px] leading-none hover:bg-(--gb-ink)/10"
                >
                  {game && <ColorDot color={game.colors[0]} />}
                  {game?.shortName ?? 'Pick a game'}
                  <ChevronDown aria-hidden className="size-3" />
                </button>
              ) : (
                <Button variant="outline" size="sm">
                  {game && <ColorDot color={game.colors[0]} />}
                  {game?.shortName ?? 'Pick a game'}
                  <ChevronDown aria-hidden className="opacity-60" />
                </Button>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className={cn(
                'min-w-44',
                gameTheme &&
                  'pokedex-game rounded-none border-2 border-(--gb-ink) text-[8px] shadow-none ring-0',
              )}
            >
              <DropdownMenuRadioGroup
                value={gameId ?? ''}
                onValueChange={pickGame}
              >
                {pickableGames.map((option) => (
                  <DropdownMenuRadioItem key={option.id} value={option.id}>
                    <ColorDot color={option.colors[0]} />
                    {option.shortName}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      }
    />
  );
};
