import { readdirSync } from 'node:fs';
import { join } from 'node:path';

import { forGame, read } from './disassembly.mjs';

const TEXT_TOKENS = [
  ['#MON', 'POKéMON'],
  ['#', 'POKé'],
  ['<PLAYER>', 'RED'],
  ['<RIVAL>', 'BLUE'],
  ['@', ''],
];

const readText = (text) =>
  TEXT_TOKENS.reduce(
    (line, [token, value]) => line.replaceAll(token, value),
    text,
  ).replace(/ {2,}/g, ' ');

const TEXT_DIRS = ['text', 'data/text'];

const SHARED_TEXT_POINTERS = 'home/overworld_text.asm';

const textFiles = (game) =>
  TEXT_DIRS.flatMap((dir) =>
    readdirSync(join(game.dir, dir)).map((file) =>
      read(game.dir, `${dir}/${file}`),
    ),
  );

const labelLine = (lines, label) =>
  lines.findIndex((line) => line === `${label}:` || line === `${label}::`);

export const mapText = (game, file, textId) => {
  const script = forGame(read(game.dir, `scripts/${file}.asm`), game.define);
  const label = script
    .map((line) =>
      line.match(new RegExp(`^dw_const (\\w+),\\s*TEXT_${textId}$`)),
    )
    .find(Boolean)?.[1];
  if (!label) return undefined;

  const source = [
    script,
    forGame(read(game.dir, SHARED_TEXT_POINTERS), game.define),
  ].find((lines) => labelLine(lines, label) >= 0);

  if (!source) return undefined;

  const start = labelLine(source, label);
  const next = source
    .slice(start + 1)
    .findIndex((line) => /^[A-Za-z_]\w*:/.test(line));
  const block = source.slice(
    start + 1,
    next < 0 ? undefined : start + 1 + next,
  );
  const fars = block.flatMap(
    (line) => line.match(/^text_far (\w+)$/)?.slice(1) ?? [],
  );

  if (fars.length === 0 && block.some((line) => line.startsWith('farcall ')))
    return farText(game, `_${label}`);
  if (fars.length !== 1) return undefined;
  if (block[0] !== 'text_asm' && block[1] !== 'text_end') return undefined;

  return farText(game, fars[0]);
};

export const trainerTexts = (game, file, textId) => {
  const path = `scripts/${file}.asm`;
  const script = forGame(read(game.dir, path), game.define);
  const label = script
    .map((line) =>
      line.match(new RegExp(`^dw_const (\\w+),\\s*TEXT_${textId}$`)),
    )
    .find(Boolean)?.[1];
  const start = label ? labelLine(script, label) : -1;
  const header = script
    .slice(start + 1, start + 4)
    .map((line) => line.match(/^ld hl, (\w+TrainerHeader\w*)$/)?.[1])
    .find(Boolean);

  if (start < 0 || !header) return undefined;

  const [, battle, end, after] =
    script[labelLine(script, header) + 1]?.match(
      /^trainer \w+, \d+, (\w+), (\w+), (\w+)$/,
    ) ?? [];

  if (!battle) return undefined;

  return {
    battle: labelText(game, path, battle),
    end: labelText(game, path, end),
    after: labelText(game, path, after),
  };
};

export const labelText = (game, path, label) => {
  const lines = forGame(read(game.dir, path), game.define);
  const start = labelLine(lines, label);
  const far = lines[start + 1]?.match(/^text_far (\w+)$/)?.[1];

  return start >= 0 && far ? farText(game, far) : undefined;
};

export const farText = (game, far) => {
  const source = textFiles(game).find((text) => text.includes(`${far}::`));

  if (!source) return undefined;

  const lines = forGame(source, game.define);
  const paragraphs = [];

  for (const line of lines.slice(lines.indexOf(`${far}::`) + 1)) {
    const [, command, value] = line.match(/^(\w+)(?: "(.*)")?$/) ?? [];

    if (['done', 'prompt', 'text_end'].includes(command)) {
      return paragraphs
        .map((paragraph) => readText(paragraph).trim())
        .join('\n\n');
    }

    if (command === 'text_start') continue;
    if (value === undefined) return undefined;
    if (['text', 'para', 'page'].includes(command)) paragraphs.push(value);
    else if (['line', 'cont', 'next'].includes(command))
      paragraphs[paragraphs.length - 1] += /\w-$/.test(paragraphs.at(-1))
        ? value
        : ` ${value}`;
    else return undefined;
  }

  return undefined;
};
