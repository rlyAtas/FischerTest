import { describe, expect, it } from 'vitest';

import { buildExamItems, type ExamItem } from '../../../src/domain/exam-build';
import type { ExamConfig } from '../../../src/domain/exam-config';

const examConfig: ExamConfig = {
  stateCode: 'NRW',
  totalQuestions: 6,
  questionsPerTopic: 2,
  minCorrectAnswersTotal: 4,
  minCorrectAnswersPerTopic: 1,
};

const items: ExamItem[] = [
  { id: 1, topicId: 2, status: 'mastered', lastAnsweredAt: new Date('2026-01-03T00:00:00.000Z') },
  { id: 2, topicId: 1, status: 'new', lastAnsweredAt: null },
  {
    id: 3,
    topicId: 3,
    status: 'problematic',
    lastAnsweredAt: new Date('2026-01-04T00:00:00.000Z'),
  },
  {
    id: 4,
    topicId: 1,
    status: 'problematic',
    lastAnsweredAt: new Date('2026-01-05T00:00:00.000Z'),
  },
  { id: 5, topicId: 2, status: 'new', lastAnsweredAt: null },
  { id: 6, topicId: 3, status: 'learning', lastAnsweredAt: new Date('2026-01-06T00:00:00.000Z') },
  { id: 7, topicId: 1, status: 'new', lastAnsweredAt: null },
  { id: 8, topicId: 2, status: 'mastered', lastAnsweredAt: new Date('2026-01-01T00:00:00.000Z') },
  { id: 9, topicId: 3, status: 'new', lastAnsweredAt: null },
];

describe('buildExamItems', () => {
  it('builds exam items by topic order and per-topic limit', () => {
    const examItems = buildExamItems(items, examConfig, keepOrderRandom);

    expect(examItems.map((item) => item.id)).toStrictEqual([2, 7, 5, 8, 9, 3]);
  });

  it('does not mutate source items', () => {
    const originalItemIds = items.map((item) => item.id);

    buildExamItems(items, examConfig, keepOrderRandom);

    expect(items.map((item) => item.id)).toStrictEqual(originalItemIds);
  });
});

const keepOrderRandom = (maxIndex: number) => maxIndex;
