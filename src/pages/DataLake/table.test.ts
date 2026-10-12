import { describe, expect, it } from 'vitest';

import {
  addFilter,
  applyFilters,
  numberStats,
  type Row,
  searchRows,
  sortRows,
  toCsv,
  valueCounts,
} from './table';

const rows: Array<Row> = [
  { name: 'Pikachu', level: 5, games: ['Red', 'Yellow'] },
  { name: 'Eevee', level: 25, games: ['Yellow'] },
  { name: 'Flabébé', level: 12, games: ['Z-A'] },
  { name: 'Mew', games: [] },
];

describe('data lake table', () => {
  it('searches every token, ignoring accents and case', () => {
    expect(searchRows(rows, 'flabebe').map((row) => row.name)).toEqual([
      'Flabébé',
    ]);
    expect(searchRows(rows, 'red pika')).toHaveLength(1);
    expect(searchRows(rows, '  ')).toHaveLength(4);
  });

  it('filters by value, including multi-valued columns, and by range', () => {
    expect(
      applyFilters(rows, [{ column: 'games', equals: 'Yellow' }]),
    ).toHaveLength(2);
    expect(
      applyFilters(rows, [{ column: 'level', min: 10, max: 20 }]).map(
        (row) => row.name,
      ),
    ).toEqual(['Flabébé']);
  });

  it('does not add the same filter twice', () => {
    const once = addFilter([], { column: 'games', equals: 'Red' });

    expect(addFilter(once, { column: 'games', equals: 'Red' })).toBe(once);
    expect(addFilter(once, { column: 'games', equals: 'Yellow' })).toHaveLength(
      2,
    );
    expect(
      addFilter([{ column: 'level', min: 1 }], { column: 'level', min: 1 }),
    ).toHaveLength(1);
  });

  it('sorts numbers and text, keeping empty values last', () => {
    expect(
      sortRows(rows, { column: 'level', direction: 'desc' }).map(
        (row) => row.name,
      ),
    ).toEqual(['Eevee', 'Flabébé', 'Pikachu', 'Mew']);
    expect(
      sortRows(rows, { column: 'name', direction: 'asc' }).map(
        (row) => row.name,
      ),
    ).toEqual(['Eevee', 'Flabébé', 'Mew', 'Pikachu']);
  });

  it('counts values, splitting multi-valued columns', () => {
    expect(valueCounts(rows, 'games')).toEqual([
      ['Yellow', 2],
      ['Red', 1],
      ['Z-A', 1],
    ]);
  });

  it('summarises numbers', () => {
    expect(numberStats(rows, 'level')).toEqual({
      count: 3,
      min: 5,
      max: 25,
      mean: 14,
      median: 12,
    });
    expect(numberStats(rows, 'name')).toBeUndefined();
  });

  it('escapes CSV cells', () => {
    expect(
      toCsv(
        [{ name: 'Say "hi", Ash', games: ['Red', 'Blue'] }],
        [
          { id: 'name', label: 'Name', kind: 'text' },
          { id: 'games', label: 'Games', kind: 'category' },
        ],
      ),
    ).toBe('Name,Games\n"Say ""hi"", Ash","Red, Blue"');
  });
});
