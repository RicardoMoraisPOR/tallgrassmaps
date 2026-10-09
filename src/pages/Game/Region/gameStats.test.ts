import { describe, expect, it } from 'vitest';

import { getGame } from '@/data/games';
import { getRegion } from '@/data/maps';

import { gameStats } from './gameStats';

const statsFor = (id: string) => {
  const game = getGame(id)!;

  return gameStats(game, getRegion(game.region)!);
};

describe('gameStats', () => {
  it('counts what Red has mapped', () => {
    const stats = statsFor('red');

    expect(stats.pokedexSize).toBe(151);
    expect(stats.obtainableWithoutTrading).toBe(135);
    expect(stats.items?.total).toBeGreaterThan(100);
    expect(stats.items?.hidden).toBeGreaterThan(0);
    expect(stats.trainers).toBeGreaterThan(100);
    expect(stats.versionExclusives).toBeGreaterThan(0);
    expect(stats.megaEvolutions).toBe(0);
  });

  it('only counts sections that exist for Legends Z-A', () => {
    const stats = statsFor('legends-za');

    expect(stats.pokedexSize).toBe(232);
    expect(stats.items).toBeUndefined();
    expect(stats.trainers).toBeUndefined();
    expect(stats.versionExclusives).toBeUndefined();
    expect(stats.megaEvolutions).toBeGreaterThan(0);
    expect(stats.wildSpecies).toBeGreaterThan(100);
  });
});
