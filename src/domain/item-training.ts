import { DomainError } from './domain-error';
import { type SortableItem, sortItems } from './item-sort';

export type ItemWithTopic = SortableItem & { topicId: number };

export function buildAllTrainingItems<T extends SortableItem>(items: readonly T[]): T[] {
  return sortItems(items);
}

export function buildTopicTrainingItems<T extends ItemWithTopic>(items: readonly T[], topicId: number): T[] {
  const itemsWithTopic = items.filter((item) => item.topicId === topicId);
  return sortItems(itemsWithTopic);
}

export function buildFavoritesTrainingItems<T extends SortableItem>(items: readonly T[]): T[] {
  if (items.length === 0) {
    throw new DomainError('empty_favorites_training');
  }

  return sortItems(items);
}
