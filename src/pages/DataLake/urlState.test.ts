import { describe, expect, it } from 'vitest';

import type { Column } from './table';
import {
  dataLakeHref,
  readExplorerState,
  writeExplorerState,
} from './urlState';

const columns: Array<Column> = [
  { id: 'game', label: 'Game', kind: 'category' },
  { id: 'name', label: 'Name', kind: 'text' },
  { id: 'level', label: 'Level', kind: 'number' },
];

describe('data lake url state', () => {
  it('round-trips query, filters and sort', () => {
    const state = {
      query: 'pika chu',
      filters: [
        { column: 'game', equals: 'Legends: Z-A' },
        { column: 'level', min: 5, max: undefined },
      ],
      sort: { column: 'level', direction: 'desc' as const },
    };
    const params = writeExplorerState(new URLSearchParams(), state);

    expect(readExplorerState(params, columns)).toEqual(state);
  });

  it('ignores unknown columns, text columns and bad sorts', () => {
    const params = new URLSearchParams(
      'f=nope:1&f=name:Ash&f=level:abc&sort=nope:asc&sort=level:up',
    );

    expect(readExplorerState(params, columns)).toEqual({
      query: '',
      filters: [],
      sort: undefined,
    });
  });

  it('builds a link that preselects a version group', () => {
    const params = new URLSearchParams(dataLakeHref('ZA').split('?')[1]);

    expect(readExplorerState(params, columns).filters).toEqual([
      { column: 'game', equals: 'Legends: Z-A' },
    ]);
  });
});
