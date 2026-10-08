import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const SPECIES_URL = 'https://play.pokemonshowdown.com/data/pokedex.json';
const STILL_URL = 'https://play.pokemonshowdown.com/sprites/gen5';
const ANIMATED_URL = 'https://play.pokemonshowdown.com/sprites/ani';
const RENDER_URL = 'https://play.pokemonshowdown.com/sprites/dex';
const OUTPUT = new URL('../../public/sprites/pokemon/mega/', import.meta.url);
const MANIFEST = new URL(
  '../../src/data/pokedex/za/showdown-megas.json',
  import.meta.url,
);
const DEX = new URL('../../src/data/pokedex/za/za.json', import.meta.url);

const force = process.argv.includes('--force');

const species = Object.values(await (await fetch(SPECIES_URL)).json()).filter(
  (entry) => !entry.forme && !entry.baseSpecies,
);
const idByNumber = new Map(
  species.map((entry) => [
    entry.num,
    entry.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
  ]),
);

const key = (number, form) =>
  `${number}${form ? `-${form.toLowerCase()}` : ''}`;

const megas = JSON.parse(readFileSync(DEX, 'utf8')).flatMap((entry) =>
  (entry.megas ?? []).map(({ form, new: isNew }) => ({
    key: key(entry.number, form),
    id: `${idByNumber.get(entry.number)}-mega${form ? form.toLowerCase() : ''}`,
    isNew: Boolean(isNew),
  })),
);

const fetchBuffer = async (url) => {
  const response = await fetch(url);

  return response.ok ? Buffer.from(await response.arrayBuffer()) : undefined;
};

const magick = (args) => execFileSync('magick', args).toString();

const firstFrameAsSquare = (gif) => {
  const dir = mkdtempSync(join(tmpdir(), 'mega-'));
  const input = join(dir, 'in.gif');
  const output = join(dir, 'out.png');

  try {
    writeFileSync(input, gif);

    const frames = magick(['identify', '-format', '%n\n', input])
      .trim()
      .split('\n')[0];

    if (Number(frames) < 2) return undefined;

    const [width, height] = magick([
      'identify',
      '-format',
      '%w %h',
      `${input}[0]`,
    ])
      .split(' ')
      .map(Number);
    const side = Math.max(width, height);

    magick([
      `${input}[0]`,
      '-coalesce',
      '-background',
      'none',
      '-gravity',
      'center',
      '-extent',
      `${side}x${side}`,
      output,
    ]);

    return readFileSync(output);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};

const download = async (mega) => {
  if (!mega.isNew) {
    const image = await fetchBuffer(`${STILL_URL}/${mega.id}.png`);

    return image && { image, kind: 'pixel' };
  }

  const gif = await fetchBuffer(`${ANIMATED_URL}/${mega.id}.gif`);
  const frame = gif && firstFrameAsSquare(gif);

  if (frame) return { image: frame, kind: 'pixel' };

  const render = await fetchBuffer(`${RENDER_URL}/${mega.id}.png`);

  return render && { image: render, kind: 'render' };
};

const readKinds = () => {
  try {
    const kinds = JSON.parse(readFileSync(MANIFEST, 'utf8'));

    return Array.isArray(kinds) ? {} : kinds;
  } catch {
    return {};
  }
};

mkdirSync(OUTPUT, { recursive: true });

const previous = readKinds();
const available = {};
const missing = [];

for (const mega of megas) {
  const file = new URL(`${mega.key}.png`, OUTPUT);

  if (!force && existsSync(file) && previous[mega.key]) {
    available[mega.key] = previous[mega.key];
    continue;
  }

  const result = await download(mega);

  if (!result) {
    missing.push(mega.id);
    continue;
  }

  writeFileSync(file, result.image);
  available[mega.key] = result.kind;
}

for (const file of readdirSync(OUTPUT)) {
  if (!(file.replace('.png', '') in available)) {
    unlinkSync(new URL(file, OUTPUT));
  }
}

writeFileSync(MANIFEST, `${JSON.stringify(available, null, 2)}\n`);

console.log(
  `${Object.keys(available).length}/${megas.length} Mega sprites available`,
);

if (missing.length > 0) console.log(`Missing: ${missing.join(', ')}`);
