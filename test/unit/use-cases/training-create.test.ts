/**
 * Тесты проверяют только сценарий создания тренировки:
 * - use-case получает вопросы из repository,
 * - передает их доменной логике,
 * - возвращает созданную тренировку.
 */

import { describe, expect, it } from 'vitest';

import { DomainError } from '../../../src/domain/domain-error';
import type { ExamConfig } from '../../../src/domain/exam-config';
import type {
  CreateTrainingInput,
  RepositoryItem,
  RepositoryTrainingWithItems,
} from '../../../src/domain/repositories';
import { createTraining, type TrainingCreationRepositories } from '../../../src/use-cases/training-create';

const userId = 10;
const stateId = 20;
const trainingStartedAt = new Date('2026-01-01T00:00:00.000Z');

const examConfig: ExamConfig = {
  stateCode: 'NRW',
  totalQuestions: 4,
  questionsPerTopic: 2,
  minCorrectAnswersTotal: 0,
  minCorrectAnswersPerTopic: 0,
};

const sourceItems = [
  createItem({ id: 1, topicId: 1, status: 'mastered' }),
  createItem({ id: 2, topicId: 1, status: 'learning' }),
  createItem({ id: 3, topicId: 1, status: 'problematic' }),
  createItem({ id: 4, topicId: 1, status: 'new' }),
  createItem({ id: 5, topicId: 2, status: 'mastered' }),
  createItem({ id: 6, topicId: 2, status: 'new' }),
  createItem({ id: 7, topicId: 2, status: 'problematic' }),
  createItem({ id: 8, topicId: 2, status: 'learning' }),
];

describe('createTraining', () => {
  it('creates training with all items', async () => {
    const repositories = createTrainingRepositories(sourceItems);
    const training = await createTraining({ type: 'all', userId, stateId }, repositories);

    expect(training).toStrictEqual(
      createTrainingResult({
        userId,
        stateId,
        type: 'all',
        topicId: null,
        itemIds: [4, 6, 3, 7, 2, 8, 1, 5],
      }),
    );
  });

  it('creates training with topic items', async () => {
    const repositories = createTrainingRepositories(sourceItems);
    const training = await createTraining({ type: 'topic', userId, stateId, topicId: 1 }, repositories);

    expect(training).toStrictEqual(
      createTrainingResult({
        userId,
        stateId,
        type: 'topic',
        topicId: 1,
        itemIds: [4, 3, 2, 1],
      }),
    );
  });

  it('creates training with favorite items', async () => {
    const repositories = createTrainingRepositories(sourceItems, [1, 4]);

    const training = await createTraining({ type: 'favorites', userId, stateId }, repositories);

    expect(training).toStrictEqual(
      createTrainingResult({
        userId,
        stateId,
        type: 'favorites',
        topicId: null,
        itemIds: [4, 1],
      }),
    );
  });

  it('throws error when no favorite items', async () => {
    const repositories = createTrainingRepositories([createItem({ id: 1, topicId: 1, status: 'new' })], []);

    await expect(createTraining({ type: 'favorites', userId, stateId }, repositories)).rejects.toThrow(
      new DomainError('empty_favorites_training'),
    );
  });

  it('creates exam training', async () => {
    const repositories = createTrainingRepositories(sourceItems);
    const training = await createTraining(
      { type: 'exam', userId, stateId, examConfig, random: keepOrderRandom },
      repositories,
    );

    expect(training).toStrictEqual(
      createTrainingResult({
        userId,
        stateId,
        type: 'exam',
        topicId: null,
        itemIds: [4, 3, 6, 7],
      }),
    );
  });
});

function createTrainingRepositories(
  sourceItems: readonly RepositoryItem[],
  favoriteItemIds: readonly number[] = [],
): TrainingCreationRepositories {
  return {
    items: {
      async findItemsByState() {
        return [...sourceItems];
      },
      async findItemsByTopic(params) {
        return sourceItems.filter((item) => item.topicId === params.topicId);
      },
      async findFavoriteItems() {
        const favoriteItemIdSet = new Set(favoriteItemIds);
        return sourceItems.filter((item) => favoriteItemIdSet.has(item.id));
      },
    },
    trainings: {
      async createTraining(params: CreateTrainingInput) {
        return createTrainingResult(params);
      },
    },
  };
}

function createItem(input: Pick<RepositoryItem, 'id' | 'topicId' | 'status'>): RepositoryItem {
  return {
    ...input,
    lastAnsweredAt: null,
  };
}

function createTrainingResult(input: CreateTrainingInput): RepositoryTrainingWithItems {
  return {
    id: 1,
    type: input.type,
    userId: input.userId,
    stateId: input.stateId,
    topicId: input.topicId,
    startedAt: trainingStartedAt,
    finishedAt: null,
    items: input.itemIds.map((itemId, index) => createTrainingItem({ itemId, position: index + 1 })),
  };
}

function createTrainingItem(input: { itemId: number; position: number }) {
  return {
    id: input.position,
    trainingId: 1,
    itemId: input.itemId,
    position: input.position,
    answerId: null,
    isCorrect: null,
    answeredAt: null,
  };
}

const keepOrderRandom = (maxIndex: number) => maxIndex;
