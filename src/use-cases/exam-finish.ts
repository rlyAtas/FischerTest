import { type ExamConfig, nrwExamConfig } from '../domain/exam-config';
import { calculateExamReadinessPercent, type RandomAnswerGenerator } from '../domain/exam-readiness';
import { calculateExamResult, type ExamAnswerResult, type ExamResult } from '../domain/exam-result';
import { changeItemStatus } from '../domain/item-status';
import type { RandomIndexGenerator } from '../domain/random';
import type {
  ItemRepository,
  ProgressRepository,
  TrainingRepository,
  UpsertItemProgressInput,
} from '../domain/repositories';
import { AppError } from '../errors/app-error';

export type FinishExamRepositories = {
  trainings: Pick<TrainingRepository, 'findTrainingById' | 'finishTraining'>;
  items: Pick<ItemRepository, 'findItemsByState'>;
  progress: Pick<ProgressRepository, 'upsertItemProgress' | 'upsertUserProgress'>;
};

export type FinishExamParams = {
  trainingId: number;
  finishedAt: Date;
  examConfig?: ExamConfig;
  randomIndex?: RandomIndexGenerator;
  randomAnswer?: RandomAnswerGenerator;
  quantityOfSimulations?: number;
};

/**
 * Завершает экзамен, обновляет прогресс по окончательным ответам и возвращает результат.
 * Неотвеченные вопросы учитываются только в результате экзамена.
 */
export async function finishExam(input: FinishExamParams, repositories: FinishExamRepositories): Promise<ExamResult> {
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

  // Проверяем ответы и готовим изменения прогресса до первой записи.
  const items = await repositories.items.findItemsByState({
    userId: training.userId,
    stateId: training.stateId,
  });
  const itemsById = new Map(items.map((item) => [item.id, item]));
  const answers: ExamAnswerResult[] = [];
  const progressUpdates: UpsertItemProgressInput[] = [];

  for (const trainingItem of training.items) {
    const item = itemsById.get(trainingItem.itemId);

    if (item === undefined) {
      throw new AppError('item_not_found');
    }

    if (trainingItem.answerId === null) {
      answers.push({ topicId: item.topicId, isCorrect: null });
      continue;
    }

    if (trainingItem.isCorrect === null || trainingItem.answeredAt === null) {
      throw new AppError('invalid_training_item_answer');
    }

    answers.push({ topicId: item.topicId, isCorrect: trainingItem.isCorrect });
    progressUpdates.push({
      userId: training.userId,
      itemId: trainingItem.itemId,
      status: changeItemStatus(item.status, trainingItem.isCorrect),
      lastAnsweredAt: trainingItem.answeredAt,
    });
  }

  // Рассчитываем результат эмуляции экзамена
  const examConfig = input.examConfig ?? nrwExamConfig;
  const examResult = calculateExamResult(answers, examConfig);

  // Записываем прогресс вопросов
  for (const progress of progressUpdates) {
    await repositories.progress.upsertItemProgress(progress);
  }

  // Повторное чтение возвращает актуальные статусы после записи прогресса, рассчитываем готовность к реальному экзамену
  const currentItems = await repositories.items.findItemsByState({
    userId: training.userId,
    stateId: training.stateId,
  });
  const readinessPercent = calculateExamReadinessPercent(
    currentItems,
    examConfig,
    input.randomIndex,
    input.randomAnswer,
    input.quantityOfSimulations,
  );

  await repositories.trainings.finishTraining({
    trainingId: input.trainingId,
    finishedAt: input.finishedAt,
  });
  await repositories.progress.upsertUserProgress({
    userId: training.userId,
    stateId: training.stateId,
    readinessPercent,
  });

  return examResult;
}
