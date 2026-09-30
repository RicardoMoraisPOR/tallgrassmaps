import type { PokedexListProps } from '../types';
import { RbyRow } from './RbyRow';

export const RbyList = ({ entries, focus, ...context }: PokedexListProps) => (
  <>
    <ul aria-label="Pokémon" className="flex flex-col">
      {entries.map((entry) => (
        <RbyRow
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
