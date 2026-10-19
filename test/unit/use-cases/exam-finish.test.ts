import { describe, expect, it } from 'vitest';
import type { ExamConfig } from '../../../src/domain/exam-config';
import type {
  TrainingItem,
  TrainingItemCandidate,
  TrainingWithItems,
  UpsertItemProgressInput,
  UpsertUserProgressInput,
} from '../../../src/domain/repositories';
import { AppError } from '../../../src/errors/app-error';
import { type FinishExamRepositories, finishExam } from '../../../src/use-cases/exam-finish';

const trainingId = 1;
const userId = 10;
const stateId = 20;
const missingTrainingId = 999;
const firstAnsweredAt = new Date('2026-01-01T00:05:00.000Z');
const incorrectAnsweredAt = new Date('2026-01-01T00:06:00.000Z');
const learningAnsweredAt = new Date('2026-01-01T00:07:00.000Z');
const secondIncorrectAnsweredAt = new Date('2026-01-01T00:08:00.000Z');
const lastAnsweredAt = new Date('2026-01-01T00:09:00.000Z');
const previousAnsweredAt = new Date('2025-12-31T00:00:00.000Z');
const finishedAt = new Date('2026-01-01T00:10:00.000Z');
const simulationCount = 2;
const expectedReadinessPercent = 100;

const examConfig: ExamConfig = {
  stateCode: 'NRW',
  totalQuestions: 6,
  questionsPerTopic: 3,
  minCorrectAnswersTotal: 4,
  minCorrectAnswersPerTopic: 1,
};

const keepOrderRandom = (maxIndex: number) => maxIndex;
const incorrectAnswerRandom = () => 0;
const finishParams = {
  trainingId,
  finishedAt,
  examConfig,
  randomIndex: keepOrderRandom,
  randomAnswer: incorrectAnswerRandom,
  quantityOfSimulations: simulationCount,
};

type RepositoryData = {
  training: TrainingWithItems;
  items: Pick<TrainingItemCandidate, 'id' | 'topicId'>[];
  itemProgress: UpsertItemProgressInput[];
  userProgress: UpsertUserProgressInput;
};

describe('finishExam', () => {
  it('finishes exam and updates item and user progress', async () => {
    const repositoryData = createRepositoryData();
    const repositories = createRepositories(repositoryData);
    const initialRepositoryData = structuredClone(repositoryData);

    const result = await finishExam(finishParams, repositories);

    expect(result).toStrictEqual({
      correctAnswersTotal: 3,
      correctAnswersByTopic: { 1: 1, 2: 2 },
      passed: false,
      failureReason: {
        code: 'not_enough_total_correct_answers',
        correctAnswersTotal: 3,
        requiredCorrectAnswersTotal: 4,
      },
    });
    expect({
      ...repositoryData,
      itemProgress: [...repositoryData.itemProgress].sort((left, right) => left.itemId - right.itemId),
    }).toStrictEqual({
      ...initialRepositoryData,
      training: { ...initialRepositoryData.training, finishedAt },
      itemProgress: [
        { userId, itemId: 101, status: 'learning', lastAnsweredAt: firstAnsweredAt },
        { userId, itemId: 102, status: 'problematic', lastAnsweredAt: incorrectAnsweredAt },
        { userId, itemId: 103, status: 'mastered', lastAnsweredAt: learningAnsweredAt },
        { userId, itemId: 105, status: 'mastered', lastAnsweredAt: previousAnsweredAt },
        { userId, itemId: 106, status: 'mastered', lastAnsweredAt: previousAnsweredAt },
        { userId, itemId: 107, status: 'problematic', lastAnsweredAt: secondIncorrectAnsweredAt },
        { userId, itemId: 108, status: 'mastered', lastAnsweredAt },
      ],
      userProgress: { userId, stateId, readinessPercent: expectedReadinessPercent },
    });
  });

  it('throws error when training is not found', async () => {
    const repositoryData = createRepositoryData();
    const repositories = createRepositories(repositoryData);
    const initialRepositoryData = structuredClone(repositoryData);

    const result = finishExam({ ...finishParams, trainingId: missingTrainingId }, repositories);

    await expect(result).rejects.toBeInstanceOf(AppError);
    await expect(result).rejects.toMatchObject({ code: 'training_not_found' });
    expect(repositoryData).toStrictEqual(initialRepositoryData);
  });

  it.each<TrainingWithItems['type']>(['all', 'topic', 'favorites'])(
    'throws error when training type is not exam (%s)',
    async (type) => {
      const repositoryData = createRepositoryData();
      repositoryData.training.type = type;
      const repositories = createRepositories(repositoryData);
      const initialRepositoryData = structuredClone(repositoryData);

      const result = finishExam(finishParams, repositories);

      await expect(result).rejects.toBeInstanceOf(AppError);
      await expect(result).rejects.toMatchObject({ code: 'training_is_not_exam' });
      expect(repositoryData).toStrictEqual(initialRepositoryData);
    },
  );

  it('throws error when training is already finished', async () => {
    const repositoryData = createRepositoryData();
    const repositories = createRepositories(repositoryData);
    await finishExam(finishParams, repositories);
    const initialRepositoryData = structuredClone(repositoryData);
    const laterFinishedAt = new Date('2026-01-01T00:15:00.000Z');

    const result = finishExam({ ...finishParams, finishedAt: laterFinishedAt }, repositories);

    await expect(result).rejects.toBeInstanceOf(AppError);
    await expect(result).rejects.toMatchObject({ code: 'training_already_finished' });
    expect(repositoryData).toStrictEqual(initialRepositoryData);
  });

  it('throws error when item is not found in repository', async () => {
    const repositoryData = createRepositoryData();
    repositoryData.items = repositoryData.items.filter((item) => item.id !== 103);
    const repositories = createRepositories(repositoryData);
    const initialRepositoryData = structuredClone(repositoryData);

    const result = finishExam(finishParams, repositories);

    await expect(result).rejects.toBeInstanceOf(AppError);
    await expect(result).rejects.toMatchObject({ code: 'item_not_found' });
    expect(repositoryData).toStrictEqual(initialRepositoryData);
  });

  it.each<keyof Pick<TrainingItem, 'isCorrect' | 'answeredAt'>>(['isCorrect', 'answeredAt'])(
    'throws error when saved answer is incomplete (%s)',
    async (field) => {
      const repositoryData = createRepositoryData();
      repositoryData.training.items = repositoryData.training.items.map((item) =>
        item.itemId === 103 ? { ...item, [field]: null } : item,
      );
      const repositories = createRepositories(repositoryData);
      const initialRepositoryData = structuredClone(repositoryData);

      const result = finishExam(finishParams, repositories);

      await expect(result).rejects.toBeInstanceOf(AppError);
      await expect(result).rejects.toMatchObject({ code: 'invalid_training_item_answer' });
      expect(repositoryData).toStrictEqual(initialRepositoryData);
    },
  );
});

/**
 * Создаёт экзамен с пятью ответами, неотвеченным вопросом и вопросами вне экзамена.
 */
function createRepositoryData(): RepositoryData {
  return {
    training: {
      id: trainingId,
      type: 'exam',
      userId,
      stateId,
      topicId: null,
      startedAt: new Date('2026-01-01T00:00:00.000Z'),
      finishedAt: null,
      items: [
        { id: 1, trainingId, itemId: 101, position: 1, answerId: 201, isCorrect: true, answeredAt: firstAnsweredAt },
        {
          id: 2,
          trainingId,
          itemId: 102,
          position: 2,
          answerId: 202,
          isCorrect: false,
          answeredAt: incorrectAnsweredAt,
        },
        { id: 3, trainingId, itemId: 103, position: 3, answerId: 203, isCorrect: true, answeredAt: learningAnsweredAt },
        {
          id: 4,
          trainingId,
          itemId: 107,
          position: 4,
          answerId: 207,
          isCorrect: false,
          answeredAt: secondIncorrectAnsweredAt,
        },
        { id: 5, trainingId, itemId: 108, position: 5, answerId: 208, isCorrect: true, answeredAt: lastAnsweredAt },
        { id: 6, trainingId, itemId: 104, position: 6, answerId: null, isCorrect: null, answeredAt: null },
      ],
    },
    // При сохранении порядка выбираются 105, 101, 107, 106, 103, 108: готовность меняется с 0% на 100%.
    items: [
      { id: 105, topicId: 1 },
      { id: 101, topicId: 1 },
      { id: 107, topicId: 1 },
      { id: 102, topicId: 1 },
      { id: 106, topicId: 2 },
      { id: 103, topicId: 2 },
      { id: 108, topicId: 2 },
      { id: 104, topicId: 2 },
    ],
    itemProgress: [
      { userId, itemId: 102, status: 'mastered', lastAnsweredAt: previousAnsweredAt },
      { userId, itemId: 103, status: 'learning', lastAnsweredAt: previousAnsweredAt },
      { userId, itemId: 105, status: 'mastered', lastAnsweredAt: previousAnsweredAt },
      { userId, itemId: 106, status: 'mastered', lastAnsweredAt: previousAnsweredAt },
      { userId, itemId: 107, status: 'learning', lastAnsweredAt: previousAnsweredAt },
      { userId, itemId: 108, status: 'mastered', lastAnsweredAt: previousAnsweredAt },
    ],
    userProgress: { userId, stateId, readinessPercent: 0 },
  };
}

/**
 * Создаёт репозитории в памяти; каждое чтение вопросов использует текущие записи прогресса.
 */
function createRepositories(repositoryData: RepositoryData): FinishExamRepositories {
  return {
    trainings: {
      async findTrainingById(id) {
        return repositoryData.training.id === id ? repositoryData.training : null;
      },
      async finishTraining(params) {
        if (params.trainingId !== repositoryData.training.id) {
          throw new Error('Экзамен не найден в тестовом репозитории.');
        }
        repositoryData.training.finishedAt = params.finishedAt;
      },
    },
    items: {
      async findItemsByState(params) {
        if (params.userId !== repositoryData.training.userId || params.stateId !== repositoryData.training.stateId) {
          return [];
        }

        return repositoryData.items.map((item) => {
          const progress = repositoryData.itemProgress.find(
            (progress) => progress.userId === params.userId && progress.itemId === item.id,
          );
          return { ...item, status: progress?.status ?? 'new', lastAnsweredAt: progress?.lastAnsweredAt ?? null };
        });
      },
    },
    progress: {
      async upsertItemProgress(params) {
        const index = repositoryData.itemProgress.findIndex(
          (progress) => progress.userId === params.userId && progress.itemId === params.itemId,
        );
        if (index === -1) {
          repositoryData.itemProgress.push({ ...params });
        } else {
          repositoryData.itemProgress[index] = { ...params };
        }
      },
      async upsertUserProgress(params) {
        repositoryData.userProgress = { ...params };
      },
    },
  };
}
