/**
 * Оценка вероятности сдачи экзамена методом Монте-Карло
 */

import type { ExamConfig } from './exam-config';
import { calculateExamResult, type ExamAnswerResult } from './exam-result';
import type { ItemStatus } from './item-status';
import { type RandomIndexGenerator, randomIndexGenerator, shuffleItems } from './random';

export type ExamReadinessItem = {
  topicId: number;
  status: ItemStatus;
};

/**
 * Расчет вероятности сдачи экзамена в процентах
 */
export function calculateExamReadinessPercent(
  items: readonly ExamReadinessItem[],
  config: ExamConfig,
  random: RandomIndexGenerator = randomIndexGenerator,
  quantityOfSimulations: number = 1000,
): number {
  if (quantityOfSimulations <= 0) {
    return 0;
  }
  let passedSimulations = 0;
  for (let index = 0; index < quantityOfSimulations; index += 1) {
    const examItems = buildSimulationItems(items, config, random);
    const examResult = calculateResultSimulation(examItems, config, random);
    passedSimulations += examResult ? 1 : 0;
  }
  return Math.round((passedSimulations / quantityOfSimulations) * 100);
}

/**
 * Расчет результата эмуляции экзамена
 */
function calculateResultSimulation(
  items: readonly ExamReadinessItem[],
  config: ExamConfig,
  random: RandomIndexGenerator = randomIndexGenerator,
): boolean {
  const answers: ExamAnswerResult[] = [];
  for (const item of items) {
    answers.push({
      topicId: item.topicId,
      isCorrect: simulateAnswer(item.status, random),
    });
  }
  const resultSimulation = calculateExamResult(answers, config);
  return resultSimulation.passed;
}

/**
 * Получить результат ответа на один вопрос
 */
function simulateAnswer(status: ItemStatus, random: RandomIndexGenerator): boolean {
  if (status === 'mastered') return true;
  if (status === 'learning') return random(1) === 1;
  return false;
}

/**
 * Формирование списка вопросов для симуляции экзамена
 */
function buildSimulationItems(
  items: readonly ExamReadinessItem[],
  config: ExamConfig,
  random: RandomIndexGenerator = randomIndexGenerator,
): ExamReadinessItem[] {
  const examItems: ExamReadinessItem[] = [];

  // сортируем темы, чтобы результат был детерминирован
  const topicIds = [...new Set(items.map((item) => item.topicId))].sort((a, b) => a - b);

  for (const topicId of topicIds) {
    const topicItems = items.filter((item) => item.topicId === topicId);
    const selectedItems = shuffleItems(topicItems, random).slice(0, config.questionsPerTopic);
    examItems.push(...selectedItems);
  }

  return examItems;
}
