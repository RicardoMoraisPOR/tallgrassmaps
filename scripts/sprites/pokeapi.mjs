import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const SPRITE_URL =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';
const OUTPUT = new URL(
  '../../public/sprites/pokemon/pokeapi/',
  import.meta.url,
);
const MASTER = new URL(
  '../../src/data/pokedex/master-data.json',
  import.meta.url,
);
const CONCURRENCY = 4;

const force = process.argv.includes('--force');

const species = JSON.parse(readFileSync(MASTER, 'utf8'));

const ids = [
  ...new Set(
    species.flatMap(({ number, regionalForms, transformations }) => [
      number,
      ...[...(regionalForms ?? []), ...(transformations ?? [])].flatMap(
        ({ spriteId }) => (spriteId ? [spriteId] : []),
      ),
    ]),
  ),
].sort((a, b) => a - b);

const fileFor = (id) => new URL(`${id}.png`, OUTPUT);

mkdirSync(OUTPUT, { recursive: true });

const queue = ids.filter((id) => force || !existsSync(fileFor(id)));
let downloaded = 0;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchSprite = async (id, attempts = 3) => {
  for (let attempt = 1; ; attempt++) {
    const response = await fetch(`${SPRITE_URL}/${id}.png`);

    if (response.ok) return Buffer.from(await response.arrayBuffer());
    if (response.status === 404 || attempt === attempts) return undefined;

    await wait(attempt * 1000);
  }
};

const worker = async () => {
  for (let id = queue.shift(); id; id = queue.shift()) {
    const image = await fetchSprite(id);

    if (!image) continue;

    writeFileSync(fileFor(id), image);
    downloaded++;
  }
};

await Promise.all(Array.from({ length: CONCURRENCY }, worker));

const missing = ids.filter((id) => !existsSync(fileFor(id)));

console.log(
  `Downloaded ${downloaded}, ${ids.length - missing.length}/${ids.length} sprites in total`,
);

if (missing.length > 0) console.log(`Missing: ${missing.join(', ')}`);
