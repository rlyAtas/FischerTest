import { describe, expect, it } from 'vitest';

import { DomainError } from '../../../src/domain/domain-error';
import type { ItemWithAnswers, TrainingWithItems, UpsertItemProgressInput } from '../../../src/domain/repositories';
import { type AnswerExamItemRepositories, answerExamItem } from '../../../src/use-cases/exam-answer';

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
const changedAnsweredAt = new Date('2026-01-01T00:10:00.000Z');
const answerParams = { trainingId, itemId, answerId, answeredAt };

type RepositoryData = {
  training: TrainingWithItems;
  items: ItemWithAnswers[];
  progress: UpsertItemProgressInput | null;
};

describe('answerExamItem', () => {
  it('saves first answer without updating item progress or returning correctness', async () => {
    const repositoryData = createRepositoryData();
    const repositories = createRepositories(repositoryData);
    const initialProgress = structuredClone(repositoryData.progress);

    const result = await answerExamItem(answerParams, repositories);

    expect(result).toBeUndefined();
    expect(repositoryData.training.items).toStrictEqual([
      { id: 1, trainingId, itemId, position: 1, answerId, isCorrect: true, answeredAt },
    ]);
    expect(repositoryData.progress).toStrictEqual(initialProgress);
  });

  it('updates previous answer without updating item progress or returning correctness', async () => {
    const repositoryData = createRepositoryData();
    const repositories = createRepositories(repositoryData);
    const initialProgress = structuredClone(repositoryData.progress);
    await answerExamItem(answerParams, repositories);

    const result = await answerExamItem(
      { ...answerParams, answerId: incorrectAnswerId, answeredAt: changedAnsweredAt },
      repositories,
    );

    expect(result).toBeUndefined();
    expect(repositoryData.training.items).toStrictEqual([
      {
        id: 1,
        trainingId,
        itemId,
        position: 1,
        answerId: incorrectAnswerId,
        isCorrect: false,
        answeredAt: changedAnsweredAt,
      },
    ]);
    expect(repositoryData.progress).toStrictEqual(initialProgress);
  });

  it('throws error when training is not found', async () => {
    const repositoryData = createRepositoryData();
    const repositories = createRepositories(repositoryData);
    const initialRepositoryData = structuredClone(repositoryData);

    const result = answerExamItem({ ...answerParams, trainingId: missingTrainingId }, repositories);

    await expect(result).rejects.toBeInstanceOf(DomainError);
    await expect(result).rejects.toMatchObject({ code: 'training_not_found' });
    expect(repositoryData).toStrictEqual(initialRepositoryData);
  });

  it.each<TrainingWithItems['type']>(['all', 'topic', 'favorites'])(
    'throws error when training type is %s',
    async (type) => {
      const repositoryData = createRepositoryData();
      repositoryData.training.type = type;
      const repositories = createRepositories(repositoryData);
      const initialRepositoryData = structuredClone(repositoryData);

      const result = answerExamItem(answerParams, repositories);

      await expect(result).rejects.toBeInstanceOf(DomainError);
      await expect(result).rejects.toMatchObject({ code: 'training_is_not_exam' });
      expect(repositoryData).toStrictEqual(initialRepositoryData);
    },
  );

  it('throws error when training is already finished', async () => {
    const repositoryData = createRepositoryData();
    const repositories = createRepositories(repositoryData);
    await answerExamItem(answerParams, repositories);
    repositoryData.training.finishedAt = changedAnsweredAt;
    const initialRepositoryData = structuredClone(repositoryData);

    const result = answerExamItem(
      { ...answerParams, answerId: incorrectAnswerId, answeredAt: changedAnsweredAt },
      repositories,
    );

    await expect(result).rejects.toBeInstanceOf(DomainError);
    await expect(result).rejects.toMatchObject({ code: 'training_already_finished' });
    expect(repositoryData).toStrictEqual(initialRepositoryData);
  });

  it('throws error when item is not in training', async () => {
    const repositoryData = createRepositoryData();
    const repositories = createRepositories(repositoryData);
    const initialRepositoryData = structuredClone(repositoryData);

    const result = answerExamItem({ ...answerParams, itemId: otherItemId }, repositories);

    await expect(result).rejects.toBeInstanceOf(DomainError);
    await expect(result).rejects.toMatchObject({ code: 'training_item_not_found' });
    expect(repositoryData).toStrictEqual(initialRepositoryData);
  });

  it('throws error when item is not found in repository', async () => {
    const repositoryData = createRepositoryData();
    repositoryData.items = repositoryData.items.filter((item) => item.id !== itemId);
    const repositories = createRepositories(repositoryData);
    const initialRepositoryData = structuredClone(repositoryData);

    const result = answerExamItem(answerParams, repositories);

    await expect(result).rejects.toBeInstanceOf(DomainError);
    await expect(result).rejects.toMatchObject({ code: 'item_not_found' });
    expect(repositoryData).toStrictEqual(initialRepositoryData);
  });

  it('throws error when answer belongs to another item', async () => {
    const repositoryData = createRepositoryData();
    const repositories = createRepositories(repositoryData);
    const initialRepositoryData = structuredClone(repositoryData);

    const result = answerExamItem({ ...answerParams, answerId: otherAnswerId }, repositories);

    await expect(result).rejects.toBeInstanceOf(DomainError);
    await expect(result).rejects.toMatchObject({ code: 'answer_does_not_belong_to_item' });
    expect(repositoryData).toStrictEqual(initialRepositoryData);
  });
});

/**
 * Создаёт данные экзамена с неотвеченным вопросом и существующим прогрессом пользователя.
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
 * Создаёт репозитории в памяти без методов чтения или изменения прогресса.
 */
function createRepositories(repositoryData: RepositoryData): AnswerExamItemRepositories {
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
          throw new Error('Вопрос экзамена не найден в тестовом репозитории.');
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
  };
}
