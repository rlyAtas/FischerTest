import { describe, expect, it } from 'vitest';
import type { ItemWithAnswers, TrainingWithItems, UpsertItemProgressInput } from '../../../src/domain/repositories';
import { AppError } from '../../../src/errors/app-error';
import { type AnswerTrainingItemRepositories, answerTrainingItem } from '../../../src/use-cases/training-answer';

const trainingId = 1;
const userId = 10;
const stateId = 20;
const itemId = 101;
const otherItemId = 102;
const answerId = 201;
const incorrectAnswerId = 202;
const otherAnswerId = 203;
const missingTrainingId = 999;
const answeredAt = new Date('2026-01-01T00:05:00.000Z');
const answerParams = { trainingId, itemId, answerId, answeredAt };

type RepositoryData = {
  training: TrainingWithItems;
  items: ItemWithAnswers[];
  progress: UpsertItemProgressInput | null;
};

describe('answerTrainingItem', () => {
  it('saves answer and updates item progress', async () => {
    const repositoryData = createRepositoryData();
    const repositories = createRepositories(repositoryData);

    const result = await answerTrainingItem(answerParams, repositories);

    expect(result).toStrictEqual({ isCorrect: true, status: 'mastered' });
    expect(repositoryData.training.items).toStrictEqual([
      { id: 1, trainingId, itemId, position: 1, answerId, isCorrect: true, answeredAt },
    ]);
    expect(repositoryData.progress).toStrictEqual({ userId, itemId, status: 'mastered', lastAnsweredAt: answeredAt });
  });

  it('throws error when training is not found', async () => {
    const repositoryData = createRepositoryData();
    const repositories = createRepositories(repositoryData);
    const initialRepositoryData = structuredClone(repositoryData);

    const result = answerTrainingItem({ ...answerParams, trainingId: missingTrainingId }, repositories);

    await expect(result).rejects.toBeInstanceOf(AppError);
    await expect(result).rejects.toMatchObject({ code: 'training_not_found' });
    expect(repositoryData).toStrictEqual(initialRepositoryData);
  });

  it('throws error when training type is exam', async () => {
    const repositoryData = createRepositoryData();
    repositoryData.training.type = 'exam';
    const repositories = createRepositories(repositoryData);
    const initialRepositoryData = structuredClone(repositoryData);

    const result = answerTrainingItem(answerParams, repositories);

    await expect(result).rejects.toBeInstanceOf(AppError);
    await expect(result).rejects.toMatchObject({ code: 'exam_training_answer_not_allowed' });
    expect(repositoryData).toStrictEqual(initialRepositoryData);
  });

  it('throws error when item is not in training', async () => {
    const repositoryData = createRepositoryData();
    const repositories = createRepositories(repositoryData);
    const initialRepositoryData = structuredClone(repositoryData);

    const result = answerTrainingItem({ ...answerParams, itemId: otherItemId }, repositories);

    await expect(result).rejects.toBeInstanceOf(AppError);
    await expect(result).rejects.toMatchObject({ code: 'training_item_not_found' });
    expect(repositoryData).toStrictEqual(initialRepositoryData);
  });

  it('throws error when item is not found in repository', async () => {
    const repositoryData = createRepositoryData();
    repositoryData.items = repositoryData.items.filter((item) => item.id !== itemId);
    const repositories = createRepositories(repositoryData);
    const initialRepositoryData = structuredClone(repositoryData);

    const result = answerTrainingItem(answerParams, repositories);

    await expect(result).rejects.toBeInstanceOf(AppError);
    await expect(result).rejects.toMatchObject({ code: 'item_not_found' });
    expect(repositoryData).toStrictEqual(initialRepositoryData);
  });

  it('throws error when training item is already answered', async () => {
    const repositoryData = createRepositoryData();
    const repositories = createRepositories(repositoryData);
    await answerTrainingItem(answerParams, repositories);
    const initialRepositoryData = structuredClone(repositoryData);

    const result = answerTrainingItem({ ...answerParams, answerId: incorrectAnswerId }, repositories);

    await expect(result).rejects.toBeInstanceOf(AppError);
    await expect(result).rejects.toMatchObject({ code: 'training_item_already_answered' });
    expect(repositoryData).toStrictEqual(initialRepositoryData);
  });

  it('throws error when training is already finished', async () => {
    const repositoryData = createRepositoryData();
    repositoryData.training.finishedAt = answeredAt;
    const repositories = createRepositories(repositoryData);
    const initialRepositoryData = structuredClone(repositoryData);

    const result = answerTrainingItem(answerParams, repositories);

    await expect(result).rejects.toBeInstanceOf(AppError);
    await expect(result).rejects.toMatchObject({ code: 'training_already_finished' });
    expect(repositoryData).toStrictEqual(initialRepositoryData);
  });

  it('throws error when answer belongs to another item', async () => {
    const repositoryData = createRepositoryData();
    const repositories = createRepositories(repositoryData);
    const initialRepositoryData = structuredClone(repositoryData);

    const result = answerTrainingItem({ ...answerParams, answerId: otherAnswerId }, repositories);

    await expect(result).rejects.toBeInstanceOf(AppError);
    await expect(result).rejects.toMatchObject({ code: 'answer_does_not_belong_to_item' });
    expect(repositoryData).toStrictEqual(initialRepositoryData);
  });
});

/**
 * Создает данные тестовых репозиториев:
 * training - тренировка с одним неотвеченным вопросом
 * items - вопросы с вариантами ответов
 * progress - прогресс пользователя со статусом learning
 */
function createRepositoryData(): RepositoryData {
  return {
    training: {
      id: trainingId,
      type: 'all',
      userId,
      stateId,
      topicId: null,
      startedAt: new Date('2026-01-01T00:00:00.000Z'),
      finishedAt: null,
      items: [{ id: 1, trainingId, itemId, position: 1, answerId: null, isCorrect: null, answeredAt: null }],
    },
    items: [
      {
        id: itemId,
        answers: [
          { id: answerId, itemId, isCorrect: true },
          { id: incorrectAnswerId, itemId, isCorrect: false },
        ],
      },
      { id: otherItemId, answers: [{ id: otherAnswerId, itemId: otherItemId, isCorrect: true }] },
    ],
    progress: { userId, itemId, status: 'learning', lastAnsweredAt: new Date('2025-12-31T00:00:00.000Z') },
  };
}

/**
 * Создает тестовые репозитории.
 */
function createRepositories(repositoryData: RepositoryData): AnswerTrainingItemRepositories {
  return {
    trainings: {
      async findTrainingById(id) {
        return repositoryData.training.id === id ? repositoryData.training : null;
      },
      async saveTrainingItemAnswer(params) {
        const trainingItem = repositoryData.training.items.find(
          (item) => item.trainingId === params.trainingId && item.itemId === params.itemId,
        );
        if (trainingItem === undefined) {
          throw new Error('Вопрос тренировки не найден в тестовом репозитории.');
        }
        trainingItem.answerId = params.answerId;
        trainingItem.isCorrect = params.isCorrect;
        trainingItem.answeredAt = params.answeredAt;
      },
    },
    items: {
      async findItemWithAnswers(id) {
        return repositoryData.items.find((item) => item.id === id) ?? null;
      },
    },
    progress: {
      async findItemProgressByItem(params) {
        const progress = repositoryData.progress;
        return progress?.userId === params.userId && progress.itemId === params.itemId ? progress : null;
      },
      async upsertItemProgress(params) {
        repositoryData.progress = { ...params };
      },
    },
  };
}
