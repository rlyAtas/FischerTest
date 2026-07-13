import type { ExamConfig } from './exam-config';
import { type ExamTopicItem, selectExamTopicItems } from './exam-selection';
import { type RandomIndexGenerator, randomIndexGenerator } from './random';

export type ExamItem = ExamTopicItem & { topicId: number };

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
