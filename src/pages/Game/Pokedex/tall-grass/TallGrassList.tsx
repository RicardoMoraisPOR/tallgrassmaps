import type { PokedexListProps } from '../types';
import { TallGrassRow } from './TallGrassRow';

export const TallGrassList = ({
  entries,
  focus,
  ...context
}: PokedexListProps) => (
  <>
    <ul aria-label="Pokémon" className="flex flex-col gap-1.5">
      {entries.map((entry) => (
        <TallGrassRow
          key={entry.id}
          {...context}
          entry={entry}
          focused={entry.number === focus}
        />
      ))}
    </ul>
    {entries.length === 0 && (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No Pokémon match these filters.
      </p>
    )}
  </>
);
