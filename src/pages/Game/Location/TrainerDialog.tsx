import '@fontsource/press-start-2p';
import { useThemeStyle } from '@/components/settings/themes';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Game } from '@/data/games';
import type { PokedexEntry } from '@/data/pokedex/types';
import type { TrainerPokemon } from '@/data/trainers/types';
import { type PokemonSprite, usePokemonSprite } from '@/hooks/usePokemonSprite';
import { cn } from '@/lib/utils';

import { PokedexEntryLink } from './PokedexEntryLink';
import type { ListedBattle } from './trainerList';

const NUM_MOVES = 4;

type TrainerDialogProps = {
  listed: ListedBattle | undefined;
  place: string;
  game: Game;
  pokedex: Array<PokedexEntry>;
  onClose: () => void;
};

type PokemonProps = {
  pokemon: TrainerPokemon;
  name: string;
  sprite: PokemonSprite;
  onOpenPokedex: () => void;
};

export const TrainerDialog = ({
  listed,
  place,
  game,
  pokedex,
  onClose,
}: TrainerDialogProps) => {
  const spriteFor = usePokemonSprite(game);
  const gameTheme = useThemeStyle('trainers') === 'game';

  const nameOf = (number: number) =>
    pokedex.find((entry) => entry.number === number)?.name ?? `#${number}`;
  const Pokemon = gameTheme ? GamePokemon : TallGrassPokemon;
  const area = listed?.battle.floor ? undefined : listed?.battle.area;

  return (
    <Dialog
      open={listed !== undefined}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className={cn(
          'flex max-h-[85svh] flex-col p-0 sm:max-w-2xl',
          gameTheme && 'pokedex-game gb-frame rounded-none ring-0',
        )}
      >
        {listed && (
          <div
            className={cn(
              'flex min-h-0 flex-col gap-4 overflow-y-auto p-4',
              gameTheme && 'p-6',
            )}
          >
            <DialogHeader>
              <DialogTitle>{listed.label}</DialogTitle>
              <DialogDescription className={cn(!area && 'sr-only')}>
                {area ?? place}
              </DialogDescription>
            </DialogHeader>
            {listed.battle.parties.map((party) => (
              <section
                key={party.label ?? ''}
                aria-label={party.label ?? 'Party'}
                className="flex flex-col gap-2"
              >
                {party.label && (
                  <h3 className="text-xs font-medium tracking-wider text-muted-foreground uppercase pokedex-game:text-[10px] pokedex-game:font-normal pokedex-game:text-foreground">
                    {party.label}
                  </h3>
                )}
                <ul
                  className={cn(
                    'grid gap-2 sm:grid-cols-2',
                    gameTheme && 'gap-4 p-2',
                  )}
                >
                  {party.pokemon.map((pokemon, index) => (
                    <Pokemon
                      key={index}
                      pokemon={pokemon}
                      name={nameOf(pokemon.number)}
                      sprite={spriteFor(pokemon.number)}
                      onOpenPokedex={onClose}
                    />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

const TallGrassPokemon = ({
  pokemon,
  name,
  sprite,
  onOpenPokedex,
}: PokemonProps) => {
  return (
    <li className="flex flex-col gap-2 rounded-[12px] border p-2.5">
      <div className="flex items-center gap-2">
        <img
          src={sprite.src}
          alt=""
          width={96}
          height={96}
          loading="lazy"
          className={cn(
            'size-10 flex-none object-contain',
            sprite.pixelated && 'pixelated',
          )}
        />
        <PokedexEntryLink
          number={pokemon.number}
          onClick={onOpenPokedex}
          className="min-w-0 flex-1 truncate text-sm font-medium"
        >
          {name}
        </PokedexEntryLink>
        <span className="text-[13px] text-muted-foreground tabular-nums">
          Lv. {pokemon.level}
        </span>
      </div>
      <ul aria-label="Moves" className="grid grid-cols-2 gap-1">
        {pokemon.moves.map((move) => (
          <li
            key={move}
            className="truncate rounded-md bg-muted px-2 py-0.5 text-xs leading-5"
          >
            {move}
          </li>
        ))}
      </ul>
    </li>
  );
};

const GamePokemon = ({
  pokemon,
  name,
  sprite,
  onOpenPokedex,
}: PokemonProps) => {
  const emptySlots = NUM_MOVES - pokemon.moves.length;

  return (
    <li className="gb-frame flex flex-col gap-3 px-4 pt-2.5 pb-4">
      <div className="flex items-center gap-4">
        <img
          src={sprite.src}
          alt=""
          width={96}
          height={96}
          loading="lazy"
          className="size-10 flex-none object-contain"
        />
        <div className="gb-status flex min-w-0 flex-1 items-end justify-between gap-2 pr-2 pb-2 text-[10px] leading-none">
          <PokedexEntryLink
            number={pokemon.number}
            onClick={onOpenPokedex}
            className="truncate"
          >
            {name}
          </PokedexEntryLink>
          <span className="flex-none">:L{pokemon.level}</span>
        </div>
      </div>
      <ul
        aria-label="Moves"
        className="grid grid-cols-2 gap-x-3 gap-y-2.5 pl-1 text-[8px] leading-none"
      >
        {pokemon.moves.map((move) => (
          <li key={move} className="truncate">
            {move}
          </li>
        ))}
        {Array.from({ length: emptySlots }, (_, index) => (
          <li key={`empty-${index}`} aria-hidden>
            -
          </li>
        ))}
      </ul>
    </li>
  );
};
