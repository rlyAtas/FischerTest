import type { ItemStatus, StoredItemStatus } from './item-status';
import type { TrainingType } from './training';

export type RepositoryTopic = {
  id: number;
  stateId: number;
  name: string;
};

export type RepositoryAnswer = {
  id: number;
  itemId: number;
  isCorrect: boolean;
};

export type RepositoryItem = {
  id: number;
  topicId: number;
  status: ItemStatus;
  lastAnsweredAt: Date | null;
};

export type RepositoryItemWithAnswers = RepositoryItem & {
  answers: RepositoryAnswer[];
};

export type RepositoryItemProgress = {
  itemId: number;
  status: StoredItemStatus;
  lastAnsweredAt: Date;
};

export type RepositoryTraining = {
  id: number;
  type: TrainingType;
  userId: number;
  stateId: number;
  topicId: number | null;
  startedAt: Date;
  finishedAt: Date | null;
};

export type RepositoryTrainingItem = {
  id: number;
  trainingId: number;
  itemId: number;
  position: number;
  answerId: number | null;
  isCorrect: boolean | null;
  answeredAt: Date | null;
};

export type RepositoryTrainingWithItems = RepositoryTraining & {
  items: RepositoryTrainingItem[];
};

export type FindItemsByStateInput = {
  userId: number;
  stateId: number;
};

export type FindItemsByTopicInput = {
  userId: number;
  stateId: number;
  topicId: number;
};

export type FindFavoriteItemsInput = {
  userId: number;
  stateId: number;
};

export type FavoriteInput = {
  userId: number;
  itemId: number;
};

export type UpsertItemProgressInput = {
  userId: number;
  itemId: number;
  status: StoredItemStatus;
  lastAnsweredAt: Date;
};

export type UpsertUserProgressInput = {
  userId: number;
  stateId: number;
  readinessPercent: number;
};

export type CreateTrainingInput = {
  userId: number;
  stateId: number;
  type: TrainingType;
  topicId: number | null;
  itemIds: readonly number[];
};

export type SaveTrainingItemAnswerInput = {
  trainingId: number;
  itemId: number;
  answerId: number;
  isCorrect: boolean;
  answeredAt: Date;
};

export type FinishTrainingInput = {
  trainingId: number;
  finishedAt: Date;
};

/**
 * Чтение тем выбранной федеральной земли.
 */
export type TopicRepository = {
  findTopicsByState(stateId: number): Promise<RepositoryTopic[]>;
};

/**
 * Чтение вопросов вместе с текущим статусом пользователя.
 */
export type ItemRepository = {
  findItemsByState(input: FindItemsByStateInput): Promise<RepositoryItem[]>;
  findItemsByTopic(input: FindItemsByTopicInput): Promise<RepositoryItem[]>;
  findItemWithAnswers(itemId: number): Promise<RepositoryItemWithAnswers | null>;
  findFavoriteItems(input: FindFavoriteItemsInput): Promise<RepositoryItem[]>;
};

/**
 * Чтение и изменение избранных вопросов пользователя.
 */
export type FavoriteRepository = {
  addFavorite(input: FavoriteInput): Promise<void>;
  removeFavorite(input: FavoriteInput): Promise<void>;
};

/**
 * Чтение и запись прогресса пользователя.
 */
export type ProgressRepository = {
  findItemProgressByState(input: FindItemsByStateInput): Promise<RepositoryItemProgress[]>;
  upsertItemProgress(input: UpsertItemProgressInput): Promise<void>;
  upsertUserProgress(input: UpsertUserProgressInput): Promise<void>;
};

/**
 * Создание тренировок, чтение попытки и запись ответов.
 */
export type TrainingRepository = {
  createTraining(input: CreateTrainingInput): Promise<RepositoryTrainingWithItems>;
  findTrainingById(trainingId: number): Promise<RepositoryTrainingWithItems | null>;
  saveTrainingItemAnswer(input: SaveTrainingItemAnswerInput): Promise<void>;
  finishTraining(input: FinishTrainingInput): Promise<void>;
};
