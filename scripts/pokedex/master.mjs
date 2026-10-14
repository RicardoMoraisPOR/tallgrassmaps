import { writeFileSync } from 'node:fs';

const SPECIES_URL = 'https://play.pokemonshowdown.com/data/pokedex.json';
const POKEAPI_URL = 'https://pokeapi.co/api/v2/pokemon?limit=3000';
const POKEAPI_SPRITE_URL =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';
const OUTPUT = new URL(
  '../../src/data/pokedex/master-data.json',
  import.meta.url,
);
const TOTAL_SPECIES = 1025;

const specialNames = { 'Nidoran-F': 'Nidoran♀', 'Nidoran-M': 'Nidoran♂' };

const displayName = (name) =>
  (specialNames[name] ?? name).normalize('NFC').replaceAll('’', "'");

const REGIONS = {
  Alola: 'Alolan',
  Galar: 'Galarian',
  Hisui: 'Hisuian',
  Paldea: 'Paldean',
};

const response = await fetch(SPECIES_URL);

if (!response.ok) throw new Error(`${response.status} for ${SPECIES_URL}`);

const entries = Object.values(await response.json());

const pokeapiResponse = await fetch(POKEAPI_URL);

if (!pokeapiResponse.ok) {
  throw new Error(`${pokeapiResponse.status} for ${POKEAPI_URL}`);
}

const pokeapiIds = new Map(
  (await pokeapiResponse.json()).results.map(({ name, url }) => [
    name,
    Number(url.match(/\/(\d+)\/$/)[1]),
  ]),
);

const pokeapiNames = new Map([...pokeapiIds].map(([name, id]) => [id, name]));

const slugOf = (name) =>
  name
    .toLowerCase()
    .replace(/[.'’:]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const spriteIdOf = (base, suffixes) => {
  const stems = [slugOf(base.name), pokeapiNames.get(base.num)];
  const candidates = stems.flatMap((stem) =>
    suffixes.map((suffix) => `${stem}-${suffix}`),
  );
  const name = candidates.find((candidate) => pokeapiIds.has(candidate));

  if (!name) {
    console.warn(`No PokeAPI sprite id for ${base.name} ${suffixes[0]}`);
  }

  return pokeapiIds.get(name);
};

const regionalFormsOf = (base) =>
  entries
    .filter(
      (entry) =>
        base.name !== 'Pikachu' &&
        entry.baseSpecies === base.name &&
        Object.keys(REGIONS).includes(entry.forme?.split('-')[0]) &&
        !['Totem', 'Zen'].some((suffix) => entry.forme.endsWith(suffix)),
    )
    .map((entry) => {
      const [region, breed] = entry.forme.split('-');

      const suffix = [region, breed && `${breed}-breed`]
        .filter(Boolean)
        .join('-')
        .toLowerCase();

      return {
        name: `${REGIONS[region]} ${displayName(base.name)}${breed ? ` (${breed} Breed)` : ''}`,
        region,
        types: entry.types.map((type) => type.toLowerCase()),
        spriteId: spriteIdOf(base, [suffix, `${suffix}-standard`]),
      };
    });

const MEGA_VARIANTS = ['M', 'F', 'Curly', 'Droopy', 'Stretchy', 'Original'];

const transformationsOf = (base) => {
  const megas = entries
    .filter(
      (entry) =>
        entry.baseSpecies === base.name &&
        entry.forme?.split('-').includes('Mega'),
    )
    .map((entry) => {
      const form = entry.forme
        .split('-')
        .find((part) => !['Mega', ...MEGA_VARIANTS].includes(part));

      return {
        name: `Mega ${displayName(base.name)}${form ? ` ${form}` : ''}`,
        kind: 'mega',
        ...(form && { form }),
        spriteId: spriteIdOf(base, [
          `mega${form ? `-${form.toLowerCase()}` : ''}`,
        ]),
      };
    });

  return [...new Map(megas.map((mega) => [mega.name, mega])).values()].sort(
    (a, b) => a.name.localeCompare(b.name),
  );
};

const entriesByName = new Map(entries.map((entry) => [entry.name, entry]));

const evolutionNote = (parts) => parts.filter(Boolean).join(' ') || undefined;

const evolutionDetails = (base) => {
  const { evoType, evoLevel, evoItem, evoMove, evoCondition } = base;

  if (evoType === 'useItem') {
    return { method: 'item', item: evoItem, note: evoCondition };
  }

  if (evoType === 'trade') {
    return { method: 'trade', item: evoItem, note: evoCondition };
  }

  if (evoType === 'levelFriendship') {
    return {
      method: 'other',
      note: evolutionNote(['with high friendship', evoCondition]),
    };
  }

  if (evoType === 'levelHold') {
    return {
      method: 'other',
      note: evolutionNote([`when leveled up holding ${evoItem}`, evoCondition]),
    };
  }

  if (evoType === 'levelMove') {
    return {
      method: 'other',
      note: evolutionNote([`when leveled up knowing ${evoMove}`, evoCondition]),
    };
  }

  if (evoLevel && !evoType) {
    return { method: 'level', level: evoLevel, note: evoCondition };
  }

  return { method: 'other', note: evoCondition };
};

const evolvesFromOf = (base) => {
  if (!base.prevo) return undefined;

  const previous = entriesByName.get(base.prevo);

  if (!previous) throw new Error(`Unknown pre-evolution ${base.prevo}`);

  const { method, level, item, note } = evolutionDetails(base);

  return {
    number: previous.num,
    method,
    ...(level && { level }),
    ...(item && { item }),
    ...(note && { note }),
  };
};

const withForms = (base) => {
  const regionalForms = regionalFormsOf(base);
  const transformations = transformationsOf(base);
  const evolvesFrom = evolvesFromOf(base);

  return {
    number: base.num,
    name: displayName(base.name),
    types: base.types.map((type) => type.toLowerCase()),
    ...(evolvesFrom && { evolvesFrom }),
    ...(regionalForms.length > 0 && { regionalForms }),
    ...(transformations.length > 0 && { transformations }),
  };
};

const species = entries
  .filter(
    (entry) =>
      entry.num >= 1 &&
      entry.num <= TOTAL_SPECIES &&
      !entry.forme &&
      !entry.baseSpecies,
  )
  .map(withForms)
  .sort((a, b) => a.number - b.number);

for (const { regionalForms = [], transformations = [] } of species) {
  for (const form of [...regionalForms, ...transformations]) {
    if (!form.spriteId) continue;

    const { ok } = await fetch(`${POKEAPI_SPRITE_URL}/${form.spriteId}.png`, {
      method: 'HEAD',
    });

    if (!ok) {
      console.warn(`PokeAPI has no sprite for ${form.name}`);
      delete form.spriteId;
    }
  }
}

if (species.length !== TOTAL_SPECIES) {
  throw new Error(`Expected ${TOTAL_SPECIES} species, found ${species.length}`);
}

writeFileSync(OUTPUT, `${JSON.stringify(species, null, 2)}\n`);

console.log(`Wrote ${species.length} species to ${OUTPUT.pathname}`);
