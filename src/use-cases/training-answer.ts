import { DomainError } from '../domain/domain-error';
import { checkSelectedAnswer } from '../domain/item-correct';
import { changeItemStatus, getCurrentItemStatus, type StoredItemStatus } from '../domain/item-status';
import type { ItemRepository, ProgressRepository, TrainingRepository } from '../domain/repositories';

type AnswerTrainingItemTrainingRepository = Pick<TrainingRepository, 'findTrainingById' | 'saveTrainingItemAnswer'>;

type AnswerTrainingItemItemRepository = Pick<ItemRepository, 'findItemWithAnswers'>;

type AnswerTrainingItemProgressRepository = Pick<ProgressRepository, 'findItemProgressByItem' | 'upsertItemProgress'>;

export type AnswerTrainingItemRepositories = {
  trainings: AnswerTrainingItemTrainingRepository;
  items: AnswerTrainingItemItemRepository;
  progress: AnswerTrainingItemProgressRepository;
};

export type AnswerTrainingItemParams = {
  trainingId: number;
  itemId: number;
  answerId: number;
  answeredAt: Date;
};

export type AnswerTrainingItemResult = {
  isCorrect: boolean;
  status: StoredItemStatus;
};

/**
 * Сохраняет первый ответ на вопрос в обычной тренировке и сразу обновляет прогресс по вопросу.
 */
export async function answerTrainingItem(
  input: AnswerTrainingItemParams,
  repositories: AnswerTrainingItemRepositories,
): Promise<AnswerTrainingItemResult> {
  const training = await repositories.trainings.findTrainingById(input.trainingId);

  if (training === null) {
    throw new DomainError('training_not_found');
  }

  if (training.type === 'exam') {
    throw new DomainError('exam_training_answer_not_allowed');
  }

  if (training.finishedAt !== null) {
    throw new DomainError('training_already_finished');
  }

  const trainingItem = training.items.find((item) => item.itemId === input.itemId);

  if (trainingItem === undefined) {
    throw new DomainError('training_item_not_found');
  }

  if (trainingItem.answerId !== null) {
    throw new DomainError('training_item_already_answered');
  }

  const item = await repositories.items.findItemWithAnswers(input.itemId);

  if (item === null) {
    throw new DomainError('item_not_found');
  }

  const isCorrect = checkSelectedAnswer(item, input.answerId);
  const itemProgress = await repositories.progress.findItemProgressByItem({
    userId: training.userId,
    itemId: input.itemId,
  });
  const currentStatus = getCurrentItemStatus(itemProgress);
  const status = changeItemStatus(currentStatus, isCorrect);

  await repositories.trainings.saveTrainingItemAnswer({
    trainingId: input.trainingId,
    itemId: input.itemId,
    answerId: input.answerId,
    isCorrect,
    answeredAt: input.answeredAt,
  });
  await repositories.progress.upsertItemProgress({
    userId: training.userId,
    itemId: input.itemId,
    status,
    lastAnsweredAt: input.answeredAt,
  });

  return {
    isCorrect,
    status,
  };
}
