import { describe, expect, it } from 'vitest';

import { changeItemStatus, type ItemStatus } from '../../../src/domain/item-status';

describe('changeItemStatus', () => {
  it.each<{
    currentStatus: ItemStatus;
    isAnswerCorrect: boolean;
    expectedStatus: ItemStatus;
  }>([
    { currentStatus: 'new', isAnswerCorrect: true, expectedStatus: 'learning' },
    { currentStatus: 'new', isAnswerCorrect: false, expectedStatus: 'problematic' },
    { currentStatus: 'problematic', isAnswerCorrect: true, expectedStatus: 'learning' },
    { currentStatus: 'problematic', isAnswerCorrect: false, expectedStatus: 'problematic' },
    { currentStatus: 'learning', isAnswerCorrect: true, expectedStatus: 'mastered' },
    { currentStatus: 'learning', isAnswerCorrect: false, expectedStatus: 'problematic' },
    { currentStatus: 'mastered', isAnswerCorrect: true, expectedStatus: 'mastered' },
    { currentStatus: 'mastered', isAnswerCorrect: false, expectedStatus: 'problematic' },
  ])(
    'changes $currentStatus to $expectedStatus when answer correctness is $isAnswerCorrect',
    ({ currentStatus, isAnswerCorrect, expectedStatus }) => {
      expect(changeItemStatus(currentStatus, isAnswerCorrect)).toBe(expectedStatus);
    },
  );
});
