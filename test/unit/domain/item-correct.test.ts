import { describe, expect, it } from 'vitest';
import { checkSelectedAnswer, type ItemForChecking } from '../../../src/domain/item-correct';
import { AppError } from '../../../src/errors/app-error';

describe('checkSelectedAnswer', () => {
  const item: ItemForChecking = {
    id: 1,
    answers: [
      { id: 10, isCorrect: false },
      { id: 20, isCorrect: true },
    ],
  };

  it('answer is correct', () => {
    expect(checkSelectedAnswer(item, 20)).toBe(true);
  });

  it('answer is incorrect', () => {
    expect(checkSelectedAnswer(item, 10)).toBe(false);
  });

  it('throws error when answer does not belong to item', () => {
    expect(() => checkSelectedAnswer(item, 30)).toThrowError(
      expect.objectContaining({
        constructor: AppError,
        code: 'answer_does_not_belong_to_item',
      }),
    );
  });
});
