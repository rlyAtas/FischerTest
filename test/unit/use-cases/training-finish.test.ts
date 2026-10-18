import { describe, expect, it } from 'vitest';
import type { ExamConfig } from '../../../src/domain/exam-config';
import type {
  TrainingItemCandidate,
  TrainingWithItems,
  UpsertItemProgressInput,
  UpsertUserProgressInput,
} from '../../../src/domain/repositories';
import { AppError } from '../../../src/errors/app-error';
import { type FinishTrainingRepositories, finishTraining } from '../../../src/use-cases/training-finish';

const trainingId = 1;
const userId = 10;
const stateId = 20;
const missingTrainingId = 999;
const answeredAt = new Date('2026-01-01T00:05:00.000Z');
const finishedAt = new Date('2026-01-01T00:10:00.000Z');
const simulationCount = 2;
const expectedReadinessPercent = 100;

const examConfig: ExamConfig = {
  stateCode: 'NRW',
  totalQuestions: 4,
  questionsPerTopic: 2,
  minCorrectAnswersTotal: 3,
  minCorrectAnswersPerTopic: 1,
};

const keepOrderRandom = (maxIndex: number) => maxIndex;
const keepAnswerRandom = keepOrderRandom;
const finishParams = {
  trainingId,
  finishedAt,
  examConfig,
  randomIndex: keepOrderRandom,
  randomAnswer: keepAnswerRandom,
  quantityOfSimulations: simulationCount,
};

type RepositoryData = {
  training: TrainingWithItems;
  items: TrainingItemCandidate[];
  itemProgress: UpsertItemProgressInput[];
  userProgress: UpsertUserProgressInput;
};

describe('finishTraining', () => {
  it.each<{
    type: Exclude<TrainingWithItems['type'], 'exam'>;
    topicId: number | null;
    itemIds: number[];
  }>([
    { type: 'all', topicId: null, itemIds: [101, 102, 103, 104] },
    { type: 'topic', topicId: 1, itemIds: [101, 102] },
    { type: 'favorites', topicId: null, itemIds: [101, 103] },
  ])(
    'finishes $type training and recalculates readiness without changing item progress',
    async ({ type, topicId, itemIds }) => {
      const repositoryData = createRepositoryData();
      repositoryData.training.type = type;
      repositoryData.training.topicId = topicId;
      repositoryData.training.items = repositoryData.training.items
        .filter((item) => itemIds.includes(item.itemId))
        .map((item, index) => ({ ...item, position: index + 1 }));
      const repositories = createRepositories(repositoryData);
      const initialRepositoryData = structuredClone(repositoryData);

      const result = await finishTraining(finishParams, repositories);

      expect(result).toBeUndefined();
      expect(repositoryData).toStrictEqual({
        ...initialRepositoryData,
        training: { ...initialRepositoryData.training, finishedAt },
        userProgress: { userId, stateId, readinessPercent: expectedReadinessPercent },
      });
    },
  );

  it('throws error when training is not found', async () => {
    const repositoryData = createRepositoryData();
    const repositories = createRepositories(repositoryData);
    const initialRepositoryData = structuredClone(repositoryData);

    const result = finishTraining({ ...finishParams, trainingId: missingTrainingId }, repositories);

    await expect(result).rejects.toBeInstanceOf(AppError);
    await expect(result).rejects.toMatchObject({ code: 'training_not_found' });
    expect(repositoryData).toStrictEqual(initialRepositoryData);
  });

  it('throws error when training type is exam', async () => {
    const repositoryData = createRepositoryData();
    repositoryData.training.type = 'exam';
    const repositories = createRepositories(repositoryData);
    const initialRepositoryData = structuredClone(repositoryData);

    const result = finishTraining(finishParams, repositories);

    await expect(result).rejects.toBeInstanceOf(AppError);
    await expect(result).rejects.toMatchObject({ code: 'training_type_not_supported' });
    expect(repositoryData).toStrictEqual(initialRepositoryData);
  });

  it('throws error when training is already finished', async () => {
    const repositoryData = createRepositoryData();
    const repositories = createRepositories(repositoryData);
    await finishTraining(finishParams, repositories);
    const initialRepositoryData = structuredClone(repositoryData);
    const laterFinishedAt = new Date('2026-01-01T00:15:00.000Z');

    const result = finishTraining({ ...finishParams, finishedAt: laterFinishedAt }, repositories);

    await expect(result).rejects.toBeInstanceOf(AppError);
    await expect(result).rejects.toMatchObject({ code: 'training_already_finished' });
    expect(repositoryData).toStrictEqual(initialRepositoryData);
  });
});

/**
 * Создаёт тренировку с отвеченным вопросом, новым вопросом и вопросами с прошлым прогрессом.
 */
function createRepositoryData(): RepositoryData {
  const previousAnsweredAt = new Date('2025-12-31T00:00:00.000Z');

  return {
    training: {
      id: trainingId,
      type: 'all',
      userId,
      stateId,
      topicId: null,
      startedAt: new Date('2026-01-01T00:00:00.000Z'),
      finishedAt: null,
      items: [
        { id: 1, trainingId, itemId: 101, position: 1, answerId: 201, isCorrect: true, answeredAt },
        ...[102, 103, 104].map((itemId, index) => ({
          id: index + 2,
          trainingId,
          itemId,
          position: index + 2,
          answerId: null,
          isCorrect: null,
          answeredAt: null,
        })),
      ],
    },
    // При фиксированном правильном ответе на learning обе симуляции дают три верных ответа из четырёх.
    items: [
      { id: 101, topicId: 1, status: 'learning', lastAnsweredAt: answeredAt },
      { id: 102, topicId: 1, status: 'new', lastAnsweredAt: null },
      { id: 103, topicId: 2, status: 'mastered', lastAnsweredAt: previousAnsweredAt },
      { id: 104, topicId: 2, status: 'mastered', lastAnsweredAt: previousAnsweredAt },
    ],
    itemProgress: [
      { userId, itemId: 101, status: 'learning', lastAnsweredAt: answeredAt },
      { userId, itemId: 103, status: 'mastered', lastAnsweredAt: previousAnsweredAt },
      { userId, itemId: 104, status: 'mastered', lastAnsweredAt: previousAnsweredAt },
    ],
    userProgress: { userId, stateId, readinessPercent: 0 },
  };
}

/**
 * Создаёт репозитории в памяти для чтения вопросов земли, завершения тренировки и записи готовности.
 */
function createRepositories(repositoryData: RepositoryData): FinishTrainingRepositories {
  return {
    trainings: {
      async findTrainingById(id) {
        return repositoryData.training.id === id ? repositoryData.training : null;
      },
      async finishTraining(params) {
        if (params.trainingId !== repositoryData.training.id) {
          throw new Error('Тренировка не найдена в тестовом репозитории.');
        }
        repositoryData.training.finishedAt = params.finishedAt;
      },
    },
    items: {
      async findItemsByState(params) {
        return params.userId === repositoryData.training.userId && params.stateId === repositoryData.training.stateId
          ? repositoryData.items
          : [];
      },
    },
    progress: {
      async upsertUserProgress(params) {
        repositoryData.userProgress = { ...params };
      },
    },
  };
}
