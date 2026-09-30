import type { CSSProperties } from 'react';

export const PokemonTypeTags = ({ types }: { types: Array<string> }) => (
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
          className="rounded-full border border-(--pokemon-type-white-theme-color) px-1.5 py-0.5 text-[11px] leading-none capitalize text-(--pokemon-type-white-theme-color) dark:border-(--pokemon-type-dark-theme-color) dark:text-(--pokemon-type-dark-theme-color) pokedex-game:rounded-none pokedex-game:border-2 pokedex-game:px-1 pokedex-game:py-[3px] pokedex-game:text-[8px]"
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
  normal: { darkThemeColor: '#A8A77A', whiteThemeColor: '#626148' },
  fire: { darkThemeColor: '#EE8130', whiteThemeColor: '#99460E' },
  water: { darkThemeColor: '#6390F0', whiteThemeColor: '#385DA8' },
  electric: { darkThemeColor: '#F7D02C', whiteThemeColor: '#745C00' },
  grass: { darkThemeColor: '#7AC74C', whiteThemeColor: '#3D6A22' },
  ice: { darkThemeColor: '#96D9D6', whiteThemeColor: '#306966' },
  fighting: { darkThemeColor: '#DD5F5A', whiteThemeColor: '#92241F' },
  poison: { darkThemeColor: '#C362C2', whiteThemeColor: '#792D78' },
  ground: { darkThemeColor: '#E2BF65', whiteThemeColor: '#755C19' },
  flying: { darkThemeColor: '#A98FF3', whiteThemeColor: '#684FB0' },
  psychic: { darkThemeColor: '#F95587', whiteThemeColor: '#AB2E55' },
  bug: { darkThemeColor: '#A6B91A', whiteThemeColor: '#5A640D' },
  rock: { darkThemeColor: '#B6A136', whiteThemeColor: '#6D601D' },
  ghost: { darkThemeColor: '#967EB5', whiteThemeColor: '#574073' },
  dragon: { darkThemeColor: '#956AFD', whiteThemeColor: '#5123B9' },
  dark: { darkThemeColor: '#A2816B', whiteThemeColor: '#534033' },
  steel: { darkThemeColor: '#B7B7CE', whiteThemeColor: '#5D5D75' },
  fairy: { darkThemeColor: '#D685AD', whiteThemeColor: '#90466B' },
};
