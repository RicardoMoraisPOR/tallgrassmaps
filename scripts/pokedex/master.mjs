import { writeFileSync } from 'node:fs';

const SPECIES_URL = 'https://play.pokemonshowdown.com/data/pokedex.json';
const OUTPUT = new URL(
  '../../src/data/pokedex/master-data.json',
  import.meta.url,
);
const TOTAL_SPECIES = 1025;

const specialNames = { 'Nidoran-F': 'Nidoran♀', 'Nidoran-M': 'Nidoran♂' };

const displayName = (name) =>
  (specialNames[name] ?? name).normalize('NFC').replaceAll('’', "'");

const response = await fetch(SPECIES_URL);

if (!response.ok) throw new Error(`${response.status} for ${SPECIES_URL}`);

const species = Object.values(await response.json())
  .filter(
    (entry) =>
      entry.num >= 1 &&
      entry.num <= TOTAL_SPECIES &&
      !entry.forme &&
      !entry.baseSpecies,
  )
  .map((entry) => ({
    number: entry.num,
    name: displayName(entry.name),
    types: entry.types.map((type) => type.toLowerCase()),
  }))
  .sort((a, b) => a.number - b.number);

if (species.length !== TOTAL_SPECIES) {
  throw new Error(`Expected ${TOTAL_SPECIES} species, found ${species.length}`);
}

writeFileSync(OUTPUT, `${JSON.stringify(species, null, 2)}\n`);

console.log(`Wrote ${species.length} species to ${OUTPUT.pathname}`);
