import { describe, expect, it } from 'vitest';

import { getGame } from '@/data/games';
import { rbyTrainers } from '@/data/trainers/rby';

import { listBattles } from './Location/trainerList';
import { searchTrainers } from './trainerSearch';

const battles = listBattles(rbyTrainers, getGame('red')!);

describe('searchTrainers', () => {
  it('returns every battle for an empty query', () => {
    expect(searchTrainers(battles, ' ')).toHaveLength(battles.length);
  });

  it('matches trainer names ignoring case', () => {
    const found = searchTrainers(battles, 'ERIKA');

    expect(found.length).toBeGreaterThan(0);
    expect(found.every(({ battle }) => battle.name === 'Erika')).toBe(true);
  });

  it('numbers repeated names within the same place and floor', () => {
    const lasses = searchTrainers(battles, 'lass').filter(
      ({ battle }) => battle.path === 'celadon-city/celadon-gym',
    );

    expect(lasses.length).toBeGreaterThan(0);
    expect(lasses.every(({ label }) => /^Lass( #\d+)?$/.test(label))).toBe(
      true,
    );
  });
});
