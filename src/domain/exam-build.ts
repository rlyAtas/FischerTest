import type { ExamConfig } from './exam-config';
import type { ItemStatus } from './item-status';
import { type RandomIndexGenerator, randomIndexGenerator, shuffleItems } from './random';

export type ExamTopicItem = {
  id: number;
  status: ItemStatus;
  lastAnsweredAt: Date | null;
};

export type ExamItem = ExamTopicItem & { topicId: number };

/**
 * Формирование списка вопросов для проведения эмуляции экзамена
 */
export function buildExamItems<ItemType extends ExamItem>(
  items: readonly ItemType[],
  config: ExamConfig,
  random: RandomIndexGenerator = randomIndexGenerator,
): ItemType[] {
  const examItems: ItemType[] = [];

  const topicIds = [...new Set(items.map((item) => item.topicId))].sort((a, b) => a - b);

  for (const topicId of topicIds) {
    const topicItems = items.filter((item) => item.topicId === topicId);
    const selectedItems = selectExamTopicItems(topicItems, config.questionsPerTopic, random);
    examItems.push(...selectedItems);
  }

  return examItems;
}

/**
 * Формирования вопросов для эмуляции экзамена в рамках одной темы
 */
function selectExamTopicItems<ItemType extends ExamTopicItem>(
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

/**
 * Фильтруем вопросы по заданному статусу
 */
function filterItemsByStatus<ItemType extends ExamTopicItem>(
  items: readonly ItemType[],
  status: ItemStatus,
): ItemType[] {
  return items.filter((item) => item.status === status);
}

/**
 * Сортируем изученные вопросы, чтобы ранее изученные оказывались первыми
 */
function sortMasteredItemsByOldestAnswer<ItemType extends ExamTopicItem>(items: readonly ItemType[]): ItemType[] {
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
