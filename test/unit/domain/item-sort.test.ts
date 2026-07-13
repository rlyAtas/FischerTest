import { describe, expect, it } from 'vitest';

import { type SortableItem, sortItems } from '../../../src/domain/item-sort';

const items: SortableItem[] = [
  { id: 1, status: 'mastered' },
  { id: 2, status: 'learning' },
  { id: 3, status: 'problematic' },
  { id: 4, status: 'new' },
  { id: 5, status: 'new' },
  { id: 6, status: 'problematic' },
  { id: 7, status: 'learning' },
  { id: 8, status: 'mastered' },
];

describe('sortItems', () => {
  it('sorts items by training status order and keeps stable order inside status groups', () => {
    expect(sortItems(items)).toStrictEqual([
      { id: 4, status: 'new' },
      { id: 5, status: 'new' },
      { id: 3, status: 'problematic' },
      { id: 6, status: 'problematic' },
      { id: 2, status: 'learning' },
      { id: 7, status: 'learning' },
      { id: 1, status: 'mastered' },
      { id: 8, status: 'mastered' },
    ]);
  });
});
