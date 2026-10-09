import { pokemonTypeColors } from '../pokemonTypeColors';

export const ZaTypeTags = ({ types }: { types: Array<string> }) => (
  <ul aria-label="Types" className="flex flex-wrap gap-1.5 lg:gap-2">
    {types.map((type) => (
      <li
        key={type}
        style={{ backgroundColor: pokemonTypeColors[type]?.whiteThemeColor }}
        className="inline-flex h-5 items-center rounded-md px-2 pb-px text-xs leading-none font-bold text-white capitalize lg:h-6 lg:px-2.5 lg:text-sm"
      >
        {type}
      </li>
    ))}
  </ul>
);
