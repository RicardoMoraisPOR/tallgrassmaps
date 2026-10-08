import { pokemonTypeColors } from '../pokemonTypeColors';

export const ZaTypeTags = ({ types }: { types: Array<string> }) => (
  <ul aria-label="Types" className="flex flex-wrap gap-2">
    {types.map((type) => (
      <li
        key={type}
        style={{ backgroundColor: pokemonTypeColors[type]?.whiteThemeColor }}
        className="inline-flex h-6 items-center rounded-md px-2.5 pb-px text-sm leading-none font-bold text-white capitalize"
      >
        {type}
      </li>
    ))}
  </ul>
);
