import type { ItemStatus } from './item-status';

export type SortableItem = {
  id: number;
  status: ItemStatus;
};

export function sortItems<T extends SortableItem>(items: readonly T[]): T[] {
  const itemsNew = items.filter((item) => item.status === 'new');
  const itemsProblematic = items.filter((item) => item.status === 'problematic');
  const itemsLearning = items.filter((item) => item.status === 'learning');
  const itemsMastered = items.filter((item) => item.status === 'mastered');

  return [...itemsNew, ...itemsProblematic, ...itemsLearning, ...itemsMastered];
}
