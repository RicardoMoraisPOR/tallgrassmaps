import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { rbyItems } from './items/rby';
import { rbyNpcs } from './npcs/rby';
import { rbyPokedex } from './pokedex/rby';
import { rbySigns } from './signs/rby';
import { rbyStaticPokemon } from './static-pokemon/rby';
import { rbyTrainers } from './trainers/rby';

const hash = (value: unknown) =>
  createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 12);

describe('RBY datasets', () => {
  it.each([
    ['items', rbyItems],
    ['npcs', rbyNpcs],
    ['pokedex', rbyPokedex],
    ['signs', rbySigns],
    ['static pokemon', rbyStaticPokemon],
    ['trainers', rbyTrainers],
  ])('keeps the %s data unchanged', (_name, data) => {
    expect(data.length).toBeGreaterThan(0);
    expect(hash(data)).toMatchSnapshot();
  });
});

const FACINGS = ['down', 'up', 'left', 'right'];

const spritesOf = (): Array<string> => [
  ...rbyItems.flatMap(({ sprite }) => (sprite ? [sprite] : [])),
  ...rbyNpcs.flatMap(({ sprite, dialog }) => [
    sprite,
    ...dialog.flatMap(({ gift }) => (gift ? [gift.sprite] : [])),
  ]),
  ...rbySigns.flatMap(({ sprite }) => (sprite ? [sprite] : [])),
  ...rbyStaticPokemon.flatMap(({ sprite }) => (sprite ? [sprite] : [])),
  ...rbyTrainers.flatMap(({ sprite, partner, dialog = [] }) => [
    ...(sprite ? [sprite] : []),
    ...(partner ? [partner.sprite] : []),
    ...dialog.flatMap(({ gift }) => (gift ? [gift.sprite] : [])),
  ]),
];

describe('RBY dataset shape', () => {
  it('points every sprite at an existing overworld sprite', () => {
    const missing = spritesOf().filter(
      (sprite) =>
        !sprite.startsWith('/sprites/rby/overworld/') ||
        !existsSync(join(process.cwd(), 'public', sprite)),
    );

    expect([...new Set(missing)]).toEqual([]);
  });

  it('uses known facings', () => {
    const facings = [
      ...rbyNpcs.map(({ facing }) => facing),
      ...rbyTrainers.flatMap(({ facing, partner }) => [
        ...(facing ? [facing] : []),
        ...(partner ? [partner.facing] : []),
      ]),
    ];

    expect(facings.filter((facing) => !FACINGS.includes(facing))).toEqual([]);
  });
});
