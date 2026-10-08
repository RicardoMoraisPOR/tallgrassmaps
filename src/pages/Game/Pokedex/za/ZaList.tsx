import type { PokedexListProps } from '../types';
import { ZaRow } from './ZaRow';

export const ZaList = ({
  entries,
  focus,
  selectedNumber,
  onSelectNumber,
  ...context
}: PokedexListProps) => (
  <>
    <ul
      aria-label="Pokémon"
      className="grid grid-cols-[repeat(auto-fill,minmax(4.5rem,1fr))] gap-2.5 px-4 pt-3 pb-6"
    >
      {entries.map((entry) => (
        <ZaRow
          key={entry.id}
          {...context}
          entry={entry}
          selected={entry.number === selectedNumber}
          focused={entry.number === focus}
          onSelect={() => onSelectNumber?.(entry.number)}
        />
      ))}
    </ul>
    {entries.length === 0 && (
      <p className="py-8 text-center text-base text-white/70">
        No Pokémon match these filters.
      </p>
    )}
  </>
);
