import { DomainError } from './domain-error';
import { type SortableItem, sortItems } from './item-sort';

export type ItemWithTopic = SortableItem & { topicId: number };
export type ItemWithFavorites = SortableItem & { isFavorite: boolean };

export function buildAllTrainingItems<T extends SortableItem>(items: readonly T[]): T[] {
  return sortItems(items);
}

export function buildTopicTrainingItems<T extends ItemWithTopic>(
  items: readonly T[],
  topicId: number,
): T[] {
  const itemsWithTopic = items.filter((item) => item.topicId === topicId);
  return sortItems(itemsWithTopic);
}

export function buildFavoritesTrainingItems<T extends ItemWithFavorites>(items: readonly T[]): T[] {
  const favoriteItems = items.filter((item) => item.isFavorite === true);

  if (favoriteItems.length === 0) {
    throw new DomainError('empty_favorites_training');
  }

  return sortItems(favoriteItems);
}
