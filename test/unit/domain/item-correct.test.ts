import { describe, expect, it } from 'vitest';

import { DomainError } from '../../../src/domain/domain-error';
import { checkSelectedAnswer, type Item } from '../../../src/domain/item-correct';

const item: Item = {
  id: 1,
  answers: [
    { id: 1, isCorrect: true },
    { id: 2, isCorrect: false },
    { id: 3, isCorrect: false },
  ],
};

describe('checkSelectedAnswer', () => {
  it.each<{
    answerId: number;
    expectedCorrect: boolean;
  }>([
    { answerId: 1, expectedCorrect: true },
    { answerId: 2, expectedCorrect: false },
  ])('returns $expectedCorrect', ({ answerId, expectedCorrect }) => {
    expect(checkSelectedAnswer(item, answerId)).toBe(expectedCorrect);
  });

  it('throws domain error when answer does not belong to item', () => {
    expect(() => checkSelectedAnswer(item, 4)).toThrow(new DomainError('answer_does_not_belong_to_item'));
  });
});
