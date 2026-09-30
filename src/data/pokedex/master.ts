import data from './master-data.json';
import type { PokedexData, PokedexEntry, Species } from './types';

export const species = data as Array<Species>;

const speciesByNumber = new Map(species.map((entry) => [entry.number, entry]));

export const getSpecies = (number: number) => speciesByNumber.get(number);

export const withSpecies = (entries: Array<PokedexData>): Array<PokedexEntry> =>
  entries.map((entry) => {
    const base = speciesByNumber.get(entry.number);

    if (!base) {
      throw new Error(`Pokémon #${entry.number} is missing from master data`);
    }

    return {
      ...entry,
      name: entry.name ?? base.name,
      types: entry.types ?? base.types,
    };
  });
