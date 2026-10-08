import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname } from 'node:path';

const API_URL = 'https://bulbapedia.bulbagarden.net/w/api.php';
const OUTPUT = new URL('../../public/sprites/', import.meta.url);
const DEX = new URL('../../src/data/pokedex/za/za.json', import.meta.url);
const BATCH_SIZE = 50;
const DELAY_MS = 300;
const USER_AGENT = 'tallgrassmaps-sprite-fetch/1.0';

const force = process.argv.includes('--force');

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithRetry = async (url, attempts = 3) => {
  for (let attempt = 1; ; attempt++) {
    try {
      return execFileSync('curl', ['-sfL', '-A', USER_AGENT, url], {
        maxBuffer: 64 * 1024 * 1024,
      });
    } catch {
      if (attempt === attempts) throw new Error(`Failed to fetch ${url}`);
    }

    await wait(attempt * 1000);
  }
};

const dex = JSON.parse(readFileSync(DEX, 'utf8'));

const slug = (name) => name.toLowerCase().replaceAll(' ', '-');
const padded = (number) => String(number).padStart(4, '0');

const species = [...new Set(dex.map((entry) => entry.number))]
  .sort((a, b) => a - b)
  .map((number) => ({
    title: `File:Menu ZA ${padded(number)}.png`,
    path: `pokemon/legends-za/${number}.png`,
  }));

const megas = dex.flatMap((entry) =>
  (entry.megas ?? []).map(({ form, stone }) => ({
    title: `File:Menu ZA ${padded(entry.number)}-Mega${form ? ` ${form}` : ''}.png`,
    path: `pokemon/legends-za/mega/${entry.number}${form ? `-${form.toLowerCase()}` : ''}.png`,
    stone,
  })),
);

const stones = [...new Set(megas.map(({ stone }) => stone))].map((stone) => ({
  title: `File:Bag ${stone} ZA Sprite.png`,
  path: `items/mega-stones/${slug(stone)}.png`,
}));

const jobs = [...species, ...megas, ...stones];

const lookup = async (batch) => {
  const params = new URLSearchParams({
    action: 'query',
    titles: batch.map(({ title }) => title).join('|'),
    prop: 'imageinfo',
    iiprop: 'url',
    format: 'json',
  });
  const { query } = JSON.parse(await fetchWithRetry(`${API_URL}?${params}`));
  const normalized = new Map(
    (query.normalized ?? []).map(({ from, to }) => [to, from]),
  );

  return Object.values(query.pages).flatMap((page) =>
    page.imageinfo
      ? [[normalized.get(page.title) ?? page.title, page.imageinfo[0].url]]
      : [],
  );
};

const fileFor = (job) => new URL(job.path, OUTPUT);

const wanted = jobs.filter((job) => force || !existsSync(fileFor(job)));
const urls = new Map();

for (let i = 0; i < wanted.length; i += BATCH_SIZE) {
  for (const [title, url] of await lookup(wanted.slice(i, i + BATCH_SIZE))) {
    urls.set(title, url);
  }

  await wait(DELAY_MS);
}

let downloaded = 0;

for (const job of wanted) {
  const url = urls.get(job.title);

  if (!url) continue;

  mkdirSync(dirname(fileFor(job).pathname), { recursive: true });
  writeFileSync(fileFor(job), await fetchWithRetry(url));
  downloaded++;

  await wait(DELAY_MS);
}

const missing = jobs.filter((job) => !existsSync(fileFor(job)));

const bytes = jobs.reduce(
  (sum, job) =>
    sum + (existsSync(fileFor(job)) ? statSync(fileFor(job)).size : 0),
  0,
);

console.log(
  `Downloaded ${downloaded}, ${jobs.length - missing.length}/${jobs.length} sprites in total (${(bytes / 1024 / 1024).toFixed(1)} MB)`,
);

if (missing.length > 0) {
  console.log(`Missing: ${missing.map(({ path }) => path).join(', ')}`);
}
