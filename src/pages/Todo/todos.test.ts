import { describe, expect, it } from 'vitest';

import { nextUpOrder, todoGroups } from './todos';

const ids = todoGroups.flatMap(({ items }) => items.map(({ id }) => id));

describe('todos', () => {
  it('has unique ids', () => {
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('lists every item exactly once in the what-is-next order', () => {
    expect(nextUpOrder.toSorted()).toEqual(ids.toSorted());
  });
});
