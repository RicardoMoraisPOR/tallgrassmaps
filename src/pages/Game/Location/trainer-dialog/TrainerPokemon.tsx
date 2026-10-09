import type { TrainerPokemon } from '@/data/trainers/types';
import { type PokemonSprite } from '@/hooks/usePokemonSprite';
import { cn } from '@/lib/utils';

import { PokemonTypeTags } from '../../Pokedex/PokemonTypeTags';
import { PokedexEntryLink } from '../PokedexEntryLink';

const NUM_MOVES = 4;

type PokemonProps = {
  pokemon: TrainerPokemon;
  name: string;
  types: Array<string>;
  sprite: PokemonSprite;
  onOpenPokedex: () => void;
};

export const TallGrassPokemon = ({
  pokemon,
  name,
  types,
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
        <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
          <PokedexEntryLink
            number={pokemon.number}
            onClick={onOpenPokedex}
            className="max-w-full truncate text-sm font-medium"
          >
            {name}
          </PokedexEntryLink>
          <PokemonTypeTags types={types} />
        </div>
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

export const GamePokemon = ({
  pokemon,
  name,
  types,
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
        <div className="gb-status flex min-w-0 flex-1 flex-col gap-1 pr-2 pb-2 text-[10px] leading-none">
          <div className="flex min-w-0 items-end justify-between gap-2">
            <PokedexEntryLink
              number={pokemon.number}
              onClick={onOpenPokedex}
              className="truncate leading-[14px]"
            >
              {name}
            </PokedexEntryLink>
            <span className="flex-none">:L{pokemon.level}</span>
          </div>
          <PokemonTypeTags types={types} />
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
