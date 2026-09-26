import { existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';

const SPECIES_URL = 'https://play.pokemonshowdown.com/data/pokedex.json';
const SPRITE_URL = 'https://play.pokemonshowdown.com/sprites/gen5';
const OUTPUT = new URL('../../public/sprites/pokemon/', import.meta.url);
const TOTAL_SPECIES = 1025;
const CONCURRENCY = 4;

const force = process.argv.includes('--force');

const fetchWithRetry = async (url, attempts = 3) => {
  for (let attempt = 1; ; attempt++) {
    const response = await fetch(url);

    if (response.ok) return response;
    if (attempt === attempts) throw new Error(`${response.status} for ${url}`);

    await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
  }
};

const species = Object.entries(await (await fetchWithRetry(SPECIES_URL)).json())
  .filter(
    ([, entry]) => entry.num >= 1 && entry.num <= TOTAL_SPECIES && !entry.forme,
  )
  .map(([id, entry]) => ({ id, number: entry.num }));

if (species.length !== TOTAL_SPECIES) {
  throw new Error(`Expected ${TOTAL_SPECIES} species, found ${species.length}`);
}

mkdirSync(OUTPUT, { recursive: true });

const queue = species.filter(
  ({ number }) => force || !existsSync(new URL(`${number}.png`, OUTPUT)),
);
let downloaded = 0;

const worker = async () => {
  for (let next = queue.shift(); next; next = queue.shift()) {
    const response = await fetchWithRetry(`${SPRITE_URL}/${next.id}.png`);

    writeFileSync(
      new URL(`${next.number}.png`, OUTPUT),
      Buffer.from(await response.arrayBuffer()),
    );
    downloaded++;
  }
};

await Promise.all(Array.from({ length: CONCURRENCY }, worker));

const missing = species.filter(
  ({ number }) => !existsSync(new URL(`${number}.png`, OUTPUT)),
);

if (missing.length > 0) {
  throw new Error(
    `Missing sprites: ${missing.map(({ number }) => number).join(', ')}`,
  );
}

const bytes = species.reduce(
  (sum, { number }) => sum + statSync(new URL(`${number}.png`, OUTPUT)).size,
  0,
);

console.log(
  `Downloaded ${downloaded}, ${species.length} sprites in total (${(bytes / 1024 / 1024).toFixed(1)} MB)`,
);
