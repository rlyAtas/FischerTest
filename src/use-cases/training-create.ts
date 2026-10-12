import { buildExamItems } from '../domain/exam-build';
import { type ExamConfig, nrwExamConfig } from '../domain/exam-config';
import { buildAllTrainingItems, buildFavoritesTrainingItems, buildTopicTrainingItems } from '../domain/item-training';
import type { RandomIndexGenerator } from '../domain/random';
import type { Item, ItemRepository, TrainingRepository, TrainingWithItems } from '../domain/repositories';

type TrainingCreationItemRepository = Pick<
  ItemRepository,
  'findItemsByState' | 'findItemsByTopic' | 'findFavoriteItems'
>;

type TrainingCreationTrainingRepository = Pick<TrainingRepository, 'createTraining'>;

export type TrainingCreationRepositories = {
  items: TrainingCreationItemRepository;
  trainings: TrainingCreationTrainingRepository;
};

export type TrainingCreationParams =
  | {
      type: 'all';
      userId: number;
      stateId: number;
    }
  | {
      type: 'topic';
      userId: number;
      stateId: number;
      topicId: number;
    }
  | {
      type: 'favorites';
      userId: number;
      stateId: number;
    }
  | {
      type: 'exam';
      userId: number;
      stateId: number;
      examConfig?: ExamConfig;
      random?: RandomIndexGenerator;
    };

/**
 * Создает тренировку нужного типа через repository-интерфейсы.
 */
export async function createTraining(
  input: TrainingCreationParams,
  repositories: TrainingCreationRepositories,
): Promise<TrainingWithItems> {
  const trainingItems = await buildTrainingItems(input, repositories);

  return repositories.trainings.createTraining({
    userId: input.userId,
    stateId: input.stateId,
    type: input.type,
    topicId: input.type === 'topic' ? input.topicId : null,
    itemIds: trainingItems.map((item) => item.id),
  });
}

async function buildTrainingItems(
  input: TrainingCreationParams,
  repositories: TrainingCreationRepositories,
): Promise<Item[]> {
  if (input.type === 'all') {
    const items = await repositories.items.findItemsByState({
      userId: input.userId,
      stateId: input.stateId,
    });
    return buildAllTrainingItems(items);
  }

  if (input.type === 'topic') {
    const items = await repositories.items.findItemsByTopic({
      userId: input.userId,
      stateId: input.stateId,
      topicId: input.topicId,
    });
    return buildTopicTrainingItems(items, input.topicId);
  }

  if (input.type === 'favorites') {
    const items = await repositories.items.findFavoriteItems({
      userId: input.userId,
      stateId: input.stateId,
    });
    return buildFavoritesTrainingItems(items);
  }

  if (input.type === 'exam') {
    const items = await repositories.items.findItemsByState({
      userId: input.userId,
      stateId: input.stateId,
    });
    return buildExamItems(items, input.examConfig ?? nrwExamConfig, input.random);
  }

  const unhandledInput: never = input;
  return unhandledInput;
}
