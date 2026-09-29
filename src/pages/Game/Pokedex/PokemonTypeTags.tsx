import type { CSSProperties } from 'react';

import { cn } from '@/lib/utils';

export const PokemonTypeTags = ({
  types,
  compact = false,
}: {
  types: Array<string>;
  compact?: boolean;
}) => (
  <ul aria-label="Types" className="flex flex-wrap gap-1.5">
    {types.map((type) => {
      const colors = pokemonTypeColors[type];

      return (
        <li
          key={type}
          style={
            colors
              ? ({
                  '--pokemon-type-dark-theme-color': colors.darkThemeColor,
                  '--pokemon-type-white-theme-color': colors.whiteThemeColor,
                  backgroundColor: `color-mix(in srgb, ${colors.whiteThemeColor} 16%, transparent)`,
                } as CSSProperties)
              : undefined
          }
          className={cn(
            'rounded-full border border-[var(--pokemon-type-white-theme-color)] px-1.5 py-0.5 text-[11px] capitalize text-[var(--pokemon-type-white-theme-color)] dark:border-[var(--pokemon-type-dark-theme-color)] dark:text-[var(--pokemon-type-dark-theme-color)] pokedex-game:rounded-none pokedex-game:border-2 pokedex-game:border-[var(--pokemon-type-dark-theme-color)] pokedex-game:px-1.5 pokedex-game:py-0 pokedex-game:text-[9px] pokedex-game:text-[var(--pokemon-type-dark-theme-color)]',
            compact && 'px-1 py-0 text-[9px]',
          )}
        >
          {type}
        </li>
      );
    })}
  </ul>
);

const pokemonTypeColors: Record<
  string,
  { darkThemeColor: string; whiteThemeColor: string }
> = {
  normal: { darkThemeColor: '#A8A77A', whiteThemeColor: '#66654B' },
  fire: { darkThemeColor: '#EE8130', whiteThemeColor: '#A94E10' },
  water: { darkThemeColor: '#6390F0', whiteThemeColor: '#3B62B2' },
  electric: { darkThemeColor: '#F7D02C', whiteThemeColor: '#796000' },
  grass: { darkThemeColor: '#7AC74C', whiteThemeColor: '#477B28' },
  ice: { darkThemeColor: '#96D9D6', whiteThemeColor: '#397C79' },
  fighting: { darkThemeColor: '#C22E28', whiteThemeColor: '#92241F' },
  poison: { darkThemeColor: '#A33EA1', whiteThemeColor: '#792D78' },
  ground: { darkThemeColor: '#E2BF65', whiteThemeColor: '#80641B' },
  flying: { darkThemeColor: '#A98FF3', whiteThemeColor: '#6B52B2' },
  psychic: { darkThemeColor: '#F95587', whiteThemeColor: '#B5315A' },
  bug: { darkThemeColor: '#A6B91A', whiteThemeColor: '#66720F' },
  rock: { darkThemeColor: '#B6A136', whiteThemeColor: '#776920' },
  ghost: { darkThemeColor: '#735797', whiteThemeColor: '#574073' },
  dragon: { darkThemeColor: '#6F35FC', whiteThemeColor: '#5123B9' },
  dark: { darkThemeColor: '#705746', whiteThemeColor: '#534033' },
  steel: { darkThemeColor: '#B7B7CE', whiteThemeColor: '#64647E' },
  fairy: { darkThemeColor: '#D685AD', whiteThemeColor: '#9F4E77' },
};
