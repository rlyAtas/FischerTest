import { type ExamConfig, nrwExamConfig } from '../domain/exam-config';
import { calculateExamReadinessPercent, type RandomAnswerGenerator } from '../domain/exam-readiness';
import type { RandomIndexGenerator } from '../domain/random';
import type { ItemRepository, ProgressRepository, TrainingRepository } from '../domain/repositories';
import { AppError } from '../errors/app-error';

export type FinishTrainingRepositories = {
  trainings: Pick<TrainingRepository, 'findTrainingById' | 'finishTraining'>;
  items: Pick<ItemRepository, 'findItemsByState'>;
  progress: Pick<ProgressRepository, 'upsertUserProgress'>;
};

export type FinishTrainingParams = {
  trainingId: number;
  finishedAt: Date;
  examConfig?: ExamConfig;
  randomIndex?: RandomIndexGenerator;
  randomAnswer?: RandomAnswerGenerator;
  quantityOfSimulations?: number;
};

/**
 * Завершает обычную тренировку и пересчитывает готовность по актуальным статусам всех вопросов земли.
 * Прогресс отдельных вопросов уже сохранён при ответах и повторно не изменяется.
 */
export async function finishTraining(
  input: FinishTrainingParams,
  repositories: FinishTrainingRepositories,
): Promise<void> {
  const training = await repositories.trainings.findTrainingById(input.trainingId);

  if (training === null) {
    throw new AppError('training_not_found');
  }

  if (training.type === 'exam') {
    throw new AppError('exam_training_finish_not_allowed');
  }

  if (training.finishedAt !== null) {
    throw new AppError('training_already_finished');
  }

  const items = await repositories.items.findItemsByState({
    userId: training.userId,
    stateId: training.stateId,
  });
  const readinessPercent = calculateExamReadinessPercent(
    items,
    input.examConfig ?? nrwExamConfig,
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
}
