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
  'flex w-full flex-col items-center rounded-lg bg-muted pt-0.5 pb-1';

export const TrainerPartyTiles = ({
  party,
  spriteFor,
  nameOf,
  linked = true,
  columns = false,
}: TrainerPartyTilesProps) => (
  <div className="flex flex-col gap-1">
    {party.label && (
      <span className="text-xs text-muted-foreground">{party.label}</span>
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
                'size-9 object-contain',
                sprite.pixelated && 'pixelated',
              )}
            />
            <span className="text-[11px] leading-none text-muted-foreground tabular-nums">
              Lv. {pokemon.level}
            </span>
          </>
        );

        return (
          <li key={index} className="w-11">
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
