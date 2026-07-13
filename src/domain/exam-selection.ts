import type { ItemStatus } from './item-status';
import { type RandomIndexGenerator, randomIndexGenerator, shuffleItems } from './random';

export type ExamTopicItem = {
  id: number;
  status: ItemStatus;
  lastAnsweredAt: Date | null;
};

export function selectExamTopicItems<ItemType extends ExamTopicItem>(
  items: readonly ItemType[],
  limit: number,
  random: RandomIndexGenerator = randomIndexGenerator,
): ItemType[] {
  if (limit <= 0) {
    return [];
  }

  const selectedItems: ItemType[] = [];

  const addItems = (itemsToAdd: readonly ItemType[]) => {
    const remainingLimit = limit - selectedItems.length;

    if (remainingLimit <= 0) {
      return;
    }

    selectedItems.push(...itemsToAdd.slice(0, remainingLimit));
  };

  const addRandomItems = (itemsToAdd: readonly ItemType[]) => {
    if (selectedItems.length >= limit) {
      return;
    }

    addItems(shuffleItems(itemsToAdd, random));
  };

  addRandomItems(filterItemsByStatus(items, 'new'));
  addRandomItems(filterItemsByStatus(items, 'problematic'));
  addRandomItems(filterItemsByStatus(items, 'learning'));
  addItems(sortMasteredItemsByOldestAnswer(filterItemsByStatus(items, 'mastered')));

  return selectedItems;
}

function filterItemsByStatus<ItemType extends ExamTopicItem>(
  items: readonly ItemType[],
  status: ItemStatus,
): ItemType[] {
  return items.filter((item) => item.status === status);
}

function sortMasteredItemsByOldestAnswer<ItemType extends ExamTopicItem>(
  items: readonly ItemType[],
): ItemType[] {
  return [...items].sort((firstItem, secondItem) => {
    if (firstItem.lastAnsweredAt === null && secondItem.lastAnsweredAt === null) {
      return 0;
    }

    if (firstItem.lastAnsweredAt === null) {
      return 1;
    }

    if (secondItem.lastAnsweredAt === null) {
      return -1;
    }

    return firstItem.lastAnsweredAt.getTime() - secondItem.lastAnsweredAt.getTime();
  });
}
