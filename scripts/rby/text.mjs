import { existsSync, readdirSync } from 'node:fs';
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

const blockAfter = (lines, start) => {
  const next = lines
    .slice(start + 1)
    .findIndex((line) => /^[A-Za-z_]\w*:/.test(line));

  return lines.slice(start + 1, next < 0 ? undefined : start + 1 + next);
};

const firstFar = (lines) =>
  lines.map((line) => line.match(/^text_far (\w+)$/)?.[1]).find(Boolean);

export const mapTextBlock = (game, file, textId) => {
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

  return { label, block: blockAfter(source, labelLine(source, label)) };
};

const splitScriptText = (game, file, label) => {
  const path = `scripts/${file}_2.asm`;

  if (!existsSync(join(game.dir, path))) return undefined;

  const lines = forGame(read(game.dir, path), game.define);
  const start = labelLine(lines, label);
  const far = start >= 0 && firstFar(blockAfter(lines, start));

  return far ? farText(game, far) : undefined;
};

export const mapText = (game, file, textId) => {
  const { label, block } = mapTextBlock(game, file, textId) ?? {};

  if (!block) return undefined;

  const fars = block.flatMap(
    (line) => line.match(/^text_far (\w+)$/)?.slice(1) ?? [],
  );
  const printed = block
    .map((line) => line.match(/^ld hl, (\w+)$/)?.[1])
    .find(Boolean);

  const farcalled = block
    .map((line) => line.match(/^farcall (\w+)$/)?.[1])
    .find(Boolean);

  if (fars.length === 0 && farcalled)
    return farText(game, `_${label}`) ?? splitScriptText(game, file, farcalled);
  if (fars.length === 0 && printed) return splitScriptText(game, file, printed);
  if (fars.length !== 1) return undefined;
  if (block[0] !== 'text_asm' && !['text_end', 'text_asm'].includes(block[1]))
    return undefined;

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

export const farText = (game, far, values = {}) => {
  const source = textFiles(game).find((text) => text.includes(`${far}::`));

  if (!source) return undefined;

  const lines = forGame(source, game.define);
  const paragraphs = [];
  let inline = false;

  for (const line of lines.slice(lines.indexOf(`${far}::`) + 1)) {
    const ram = line.match(/^text_(?:ram|decimal|bcd) (\w+)/)?.[1];

    if (ram) {
      if (values[ram] === undefined) return undefined;

      paragraphs[paragraphs.length - 1] += values[ram];
      inline = true;
      continue;
    }

    const [, command, value] = line.match(/^(\w+)(?: "(.*)")?$/) ?? [];

    if (['done', 'prompt', 'text_end'].includes(command)) {
      return paragraphs
        .map((paragraph) => readText(paragraph).trim())
        .join('\n\n');
    }

    if (command === 'text_start') {
      inline = false;
      continue;
    }
    if (value === undefined) return undefined;
    if (command === 'text' && inline)
      paragraphs[paragraphs.length - 1] += value;
    else if (['text', 'para', 'page'].includes(command)) paragraphs.push(value);
    else if (['line', 'cont', 'next'].includes(command))
      paragraphs[paragraphs.length - 1] += /\w-$/.test(paragraphs.at(-1))
        ? value
        : ` ${value}`;
    else return undefined;

    inline = false;
  }

  return undefined;
};
