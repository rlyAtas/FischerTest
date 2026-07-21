import { describe, expect, it } from 'vitest';

import { buildExamItems, type ExamItem } from '../../../src/domain/exam-build';
import type { ExamConfig } from '../../../src/domain/exam-config';

const examConfig: ExamConfig = {
  stateCode: 'NRW',
  totalQuestions: 12,
  questionsPerTopic: 4,
  minCorrectAnswersTotal: 0,
  minCorrectAnswersPerTopic: 0,
};

const items: ExamItem[] = [
  { id: 1, topicId: 2, status: 'mastered', lastAnsweredAt: new Date('2026-01-03T00:00:00.000Z') },
  { id: 2, topicId: 1, status: 'new', lastAnsweredAt: null },
  { id: 3, topicId: 3, status: 'problematic', lastAnsweredAt: new Date('2026-01-04T00:00:00.000Z') },
  { id: 4, topicId: 1, status: 'problematic', lastAnsweredAt: new Date('2026-01-05T00:00:00.000Z') },
  { id: 5, topicId: 2, status: 'new', lastAnsweredAt: null },
  { id: 6, topicId: 3, status: 'learning', lastAnsweredAt: new Date('2026-01-06T00:00:00.000Z') },
  { id: 7, topicId: 1, status: 'new', lastAnsweredAt: null },
  { id: 8, topicId: 2, status: 'mastered', lastAnsweredAt: new Date('2026-01-01T00:00:00.000Z') },
  { id: 9, topicId: 3, status: 'new', lastAnsweredAt: null },
  { id: 10, topicId: 1, status: 'mastered', lastAnsweredAt: new Date('2026-01-03T00:00:00.000Z') },
  { id: 11, topicId: 1, status: 'learning', lastAnsweredAt: new Date('2026-01-07T00:00:00.000Z') },
  { id: 12, topicId: 1, status: 'learning', lastAnsweredAt: new Date('2026-01-08T00:00:00.000Z') },
  { id: 13, topicId: 1, status: 'problematic', lastAnsweredAt: new Date('2026-01-09T00:00:00.000Z') },
  { id: 14, topicId: 1, status: 'mastered', lastAnsweredAt: new Date('2026-01-01T00:00:00.000Z') },
  { id: 15, topicId: 1, status: 'mastered', lastAnsweredAt: null },
  { id: 16, topicId: 1, status: 'mastered', lastAnsweredAt: new Date('2026-01-02T00:00:00.000Z') },
  { id: 17, topicId: 2, status: 'problematic', lastAnsweredAt: new Date('2026-01-08T00:00:00.000Z') },
  { id: 18, topicId: 3, status: 'mastered', lastAnsweredAt: new Date('2026-01-01T00:00:00.000Z') },
];

describe('buildExamItems', () => {
  it('builds exam items by topic order, status priority and per-topic limit', () => {
    const examItems = buildExamItems(items, examConfig, reverseRandom);

    expect(examItems.map((item) => item.id)).toStrictEqual([7, 2, 13, 4, 5, 17, 8, 1, 9, 3, 6, 18]);
  });

  it('does not mutate source items', () => {
    const originalItemIds = items.map((item) => item.id);

    buildExamItems(items, examConfig, reverseRandom);

    expect(items.map((item) => item.id)).toStrictEqual(originalItemIds);
  });
});

/**
 * Возвращает всегда индекс = 0, используется для управления "случайным" перемешиванием массива методом Фишера-Йетса
 * Для пар элементов меняет их местами
 */
const reverseRandom = () => 0;
