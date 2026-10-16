import { checkSelectedAnswer } from '../domain/item-correct';
import type { ItemRepository, TrainingRepository } from '../domain/repositories';
import { AppError } from '../errors/app-error';

type AnswerExamItemTrainingRepository = Pick<TrainingRepository, 'findTrainingById' | 'saveTrainingItemAnswer'>;

type AnswerExamItemItemRepository = Pick<ItemRepository, 'findItemWithAnswers'>;

export type AnswerExamItemRepositories = {
  trainings: AnswerExamItemTrainingRepository;
  items: AnswerExamItemItemRepository;
};

export type AnswerExamItemParams = {
  trainingId: number;
  itemId: number;
  answerId: number;
  answeredAt: Date;
};

/**
 * Сохраняет или изменяет ответ в незавершённом экзамене без обновления прогресса.
 */
export async function answerExamItem(
  input: AnswerExamItemParams,
  repositories: AnswerExamItemRepositories,
): Promise<void> {
  const training = await repositories.trainings.findTrainingById(input.trainingId);

  if (training === null) {
    throw new AppError('training_not_found');
  }

  if (training.type !== 'exam') {
    throw new AppError('training_is_not_exam');
  }

  if (training.finishedAt !== null) {
    throw new AppError('training_already_finished');
  }

  const trainingItem = training.items.find((item) => item.itemId === input.itemId);

  if (trainingItem === undefined) {
    throw new AppError('training_item_not_found');
  }

  const item = await repositories.items.findItemWithAnswers(input.itemId);

  if (item === null) {
    throw new AppError('item_not_found');
  }

  const isCorrect = checkSelectedAnswer(item, input.answerId);

  await repositories.trainings.saveTrainingItemAnswer({
    trainingId: input.trainingId,
    itemId: input.itemId,
    answerId: input.answerId,
    isCorrect,
    answeredAt: input.answeredAt,
  });
}
