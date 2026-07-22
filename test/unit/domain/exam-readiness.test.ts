import { describe, expect, it } from 'vitest';

import type { ExamConfig } from '../../../src/domain/exam-config';
import { calculateExamReadinessPercent, type ExamReadinessItem } from '../../../src/domain/exam-readiness';

const examConfig: ExamConfig = {
  stateCode: 'NRW',
  totalQuestions: 6,
  questionsPerTopic: 3,
  minCorrectAnswersTotal: 4,
  minCorrectAnswersPerTopic: 2,
};
const simulationCount = 2;

describe('calculateExamReadinessPercent', () => {
  it('returns 100 when every selected item is mastered', () => {
    const percent = calculateExamReadinessPercent(
      createItems('mastered'),
      examConfig,
      keepOrderRandom,
      keepAnswerRandom,
      simulationCount,
    );

    expect(percent).toBe(100);
  });

  it('returns 0 when every selected item is new', () => {
    const percent = calculateExamReadinessPercent(
      createItems('new'),
      examConfig,
      keepOrderRandom,
      keepAnswerRandom,
      simulationCount,
    );

    expect(percent).toBe(0);
  });

  it('returns 0 when every selected item is problematic', () => {
    const percent = calculateExamReadinessPercent(
      createItems('problematic'),
      examConfig,
      keepOrderRandom,
      keepAnswerRandom,
      simulationCount,
    );

    expect(percent).toBe(0);
  });

  it('calculates percent with deterministic learning answers', () => {
    const percent = calculateExamReadinessPercent(
      createItems('learning'),
      examConfig,
      keepOrderRandom,
      createFixedRandom(
        // biome-ignore format: the array should not be formatted
        [
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, // первая симуляция сдаётся
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // вторая симуляция проваливается
        ],
      ),
      simulationCount,
    );

    expect(percent).toBe(50);
  });

  it('returns 0 when total threshold is reached but topic threshold is not reached', () => {
    const items: ExamReadinessItem[] = [
      { topicId: 1, status: 'mastered' },
      { topicId: 1, status: 'mastered' },
      { topicId: 1, status: 'mastered' },
      { topicId: 2, status: 'mastered' },
      { topicId: 2, status: 'new' },
      { topicId: 2, status: 'new' },
    ];

    const percent = calculateExamReadinessPercent(
      items,
      examConfig,
      keepOrderRandom,
      keepAnswerRandom,
      simulationCount,
    );

    expect(percent).toBe(0);
  });

  it('returns 0 when simulation count is not positive', () => {
    const simulationCount = 0;
    const percent = calculateExamReadinessPercent(
      createItems('mastered'),
      examConfig,
      keepOrderRandom,
      keepAnswerRandom,
      simulationCount,
    );

    expect(percent).toBe(0);
  });
});

function createItems(status: ExamReadinessItem['status']): ExamReadinessItem[] {
  return [
    { topicId: 1, status },
    { topicId: 1, status },
    { topicId: 1, status },
    { topicId: 2, status },
    { topicId: 2, status },
    { topicId: 2, status },
  ];
}

const keepOrderRandom = (maxIndex: number) => maxIndex;
const keepAnswerRandom = keepOrderRandom;

function createFixedRandom(values: number[]) {
  function* createValues() {
    for (const value of values) {
      yield value;
    }
  }

  const randomValues = createValues();

  return (maxIndex: number) => {
    const nextValue = randomValues.next();

    if (nextValue.done) {
      throw new Error('No fixed random value for this call.');
    }

    if (nextValue.value < 0 || nextValue.value > maxIndex) {
      throw new Error('Fixed random value is outside current max index.');
    }

    return nextValue.value;
  };
}
