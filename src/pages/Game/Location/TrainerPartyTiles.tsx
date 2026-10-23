import type { TrainerParty } from '@/data/trainers/types';
import type { PokemonSprite } from '@/hooks/usePokemonSprite';
import { cn } from '@/lib/utils';

import { PokedexEntryLink } from './PokedexEntryLink';

type TrainerPartyTilesProps = {
  party: TrainerParty;
  spriteFor: (number: number) => PokemonSprite;
  nameOf: (number: number) => string;
  linked?: boolean;
  columns?: boolean;
};

const tileClassName =
  'flex w-full flex-col items-center rounded-sm bg-muted pt-0.5 pb-1';

export const TrainerPartyTiles = ({
  party,
  spriteFor,
  nameOf,
  linked = true,
  columns = false,
}: TrainerPartyTilesProps) => (
  <div className="flex flex-col gap-1">
    {party.label && (
      <span
        className={cn('text-muted-foreground', columns ? 'text-sm' : 'text-xs')}
      >
        {party.label}
      </span>
    )}
    <ul
      aria-label={party.label ?? 'Party'}
      className={cn(
        'gap-1',
        columns ? 'grid w-max grid-cols-2' : 'flex flex-wrap',
      )}
    >
      {party.pokemon.map((pokemon, index) => {
        const sprite = spriteFor(pokemon.number);
        const title = `${nameOf(pokemon.number)}, Lv. ${pokemon.level}`;
        const content = (
          <>
            <img
              src={sprite.src}
              alt=""
              width={96}
              height={96}
              loading="lazy"
              className={cn(
                'size-16 object-contain',
                sprite.pixelated && 'pixelated',
              )}
            />
            <span
              className={cn(
                'leading-none text-muted-foreground tabular-nums',
                columns ? 'text-xs' : 'text-[11px]',
              )}
            >
              Lv. {pokemon.level}
            </span>
          </>
        );

        return (
          <li key={index} className="w-[4.5rem]">
            {linked ? (
              <PokedexEntryLink
                number={pokemon.number}
                title={title}
                aria-label={`${title}; open Pokédex entry`}
                className={cn(
                  tileClassName,
                  'no-underline transition-colors hover:bg-accent hover:no-underline hover:ring-1 hover:ring-ring/30 focus-visible:bg-accent focus-visible:no-underline focus-visible:ring-[3px] focus-visible:ring-ring/50',
                )}
              >
                {content}
              </PokedexEntryLink>
            ) : (
              <span aria-label={title} className={tileClassName}>
                {content}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  </div>
);
