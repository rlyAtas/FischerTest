import type { ItemStatus, StoredItemStatus } from './item-status';
import type { TrainingType } from './training';

export type Topic = {
  id: number;
  stateId: number;
  name: string;
};

export type Answer = {
  id: number;
  itemId: number;
  isCorrect: boolean;
};

export type TrainingItemCandidate = {
  id: number;
  topicId: number;
  status: ItemStatus;
  lastAnsweredAt: Date | null;
};

export type ItemWithAnswers = {
  id: number;
  answers: Answer[];
};

export type ItemProgress = {
  itemId: number;
  status: StoredItemStatus;
  lastAnsweredAt: Date;
};

export type ItemProgressByItemInput = {
  userId: number;
  itemId: number;
};

export type Training = {
  id: number;
  type: TrainingType;
  userId: number;
  stateId: number;
  topicId: number | null;
  startedAt: Date;
  finishedAt: Date | null;
};

export type TrainingItem = {
  id: number;
  trainingId: number;
  itemId: number;
  position: number;
  answerId: number | null;
  isCorrect: boolean | null;
  answeredAt: Date | null;
};

export type TrainingWithItems = Training & {
  items: TrainingItem[];
};

export type ItemsByStateInput = {
  userId: number;
  stateId: number;
};

export type ItemsByTopicInput = {
  userId: number;
  stateId: number;
  topicId: number;
};

export type FavoriteItemsByStateInput = {
  userId: number;
  stateId: number;
};

export type FavoriteItemInput = {
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
  findTopicsByState(stateId: number): Promise<Topic[]>;
};

/**
 * Чтение вопросов вместе с текущим статусом пользователя.
 */
export type ItemRepository = {
  /**
   * Проверяет существование вопроса без загрузки его содержимого и вариантов ответов.
   */
  existsItem(itemId: number): Promise<boolean>;
  findItemsByState(input: ItemsByStateInput): Promise<TrainingItemCandidate[]>; // TODO или передавать stateId и userId?
  findItemsByTopic(input: ItemsByTopicInput): Promise<TrainingItemCandidate[]>;
  findItemWithAnswers(itemId: number): Promise<ItemWithAnswers | null>;
  findFavoriteItems(input: FavoriteItemsByStateInput): Promise<TrainingItemCandidate[]>;
};

/**
 * Чтение и изменение избранных вопросов пользователя.
 */
export type FavoriteRepository = {
  /**
   * Добавляет вопрос в избранное. Если пара userId/itemId уже существует, успешно завершается без дубликата.
   */
  addFavorite(input: FavoriteItemInput): Promise<void>;
  /**
   * Удаляет вопрос из избранного. Если пара userId/itemId отсутствует, успешно завершается без изменений.
   */
  removeFavorite(input: FavoriteItemInput): Promise<void>;
};

/**
 * Чтение и запись прогресса пользователя.
 */
export type ProgressRepository = {
  findItemProgressByState(input: ItemsByStateInput): Promise<ItemProgress[]>;
  findItemProgressByItem(input: ItemProgressByItemInput): Promise<ItemProgress | null>;
  upsertItemProgress(input: UpsertItemProgressInput): Promise<void>;
  upsertUserProgress(input: UpsertUserProgressInput): Promise<void>;
};

/**
 * Создание тренировок, чтение попытки и запись ответов.
 */
export type TrainingRepository = {
  createTraining(input: CreateTrainingInput): Promise<TrainingWithItems>;
  findTrainingById(trainingId: number): Promise<TrainingWithItems | null>;
  saveTrainingItemAnswer(input: SaveTrainingItemAnswerInput): Promise<void>;
  finishTraining(input: FinishTrainingInput): Promise<void>;
};
