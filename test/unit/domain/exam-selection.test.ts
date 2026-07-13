import { describe, expect, it } from 'vitest';

import { type ExamTopicItem, selectExamTopicItems } from '../../../src/domain/exam-selection';

const items: ExamTopicItem[] = [
  { id: 1, status: 'mastered', lastAnsweredAt: new Date('2026-01-03T00:00:00.000Z') },
  { id: 2, status: 'new', lastAnsweredAt: null },
  { id: 3, status: 'problematic', lastAnsweredAt: new Date('2026-01-04T00:00:00.000Z') },
  { id: 4, status: 'learning', lastAnsweredAt: new Date('2026-01-05T00:00:00.000Z') },
  { id: 5, status: 'new', lastAnsweredAt: null },
  { id: 6, status: 'mastered', lastAnsweredAt: new Date('2026-01-01T00:00:00.000Z') },
  { id: 7, status: 'problematic', lastAnsweredAt: new Date('2026-01-06T00:00:00.000Z') },
  { id: 8, status: 'learning', lastAnsweredAt: new Date('2026-01-07T00:00:00.000Z') },
  { id: 9, status: 'mastered', lastAnsweredAt: null },
  { id: 10, status: 'mastered', lastAnsweredAt: new Date('2026-01-02T00:00:00.000Z') },
];

describe('selectExamTopicItems', () => {
  it('selects topic items by exam status priority and limit', () => {
    const selectedItems = selectExamTopicItems(items, 7, createFixedRandom([0, 1, 0]));

    expect(selectedItems.map((item) => item.id)).toStrictEqual([5, 2, 3, 7, 8, 4, 6]);
  });

  it('selects mastered items by oldest answer date', () => {
    const selectedItems = selectExamTopicItems(items, 10, createFixedRandom([0, 1, 0]));

    expect(selectedItems.map((item) => item.id)).toStrictEqual([5, 2, 3, 7, 8, 4, 6, 10, 1, 9]);
  });

  it('does not mutate source items', () => {
    const originalItemIds = items.map((item) => item.id);

    selectExamTopicItems(items, 10, createFixedRandom([0, 1, 0]));

    expect(items.map((item) => item.id)).toStrictEqual(originalItemIds);
  });

  it('returns empty list when limit is not positive', () => {
    expect(selectExamTopicItems(items, 0, createFixedRandom([]))).toStrictEqual([]);
    expect(selectExamTopicItems(items, -1, createFixedRandom([]))).toStrictEqual([]);
  });
});

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
