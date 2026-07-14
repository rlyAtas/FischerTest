import { describe, expect, it } from 'vitest';

import { type Answer, calculateTrainingStats } from '../../../src/domain/training-stats';

describe('calculateTrainingStats', () => {
  it('calculates stats for answered and unanswered questions', () => {
    const answers: Answer[] = [
      { isCorrect: true },
      { isCorrect: false },
      { isCorrect: true },
      { isCorrect: null },
    ];
    expect(calculateTrainingStats(answers)).toStrictEqual({
      totalQuestions: 4,
      answeredQuestions: 3,
      correctAnswers: 2,
      wrongAnswers: 1,
    });
  });

  it('calculates stats for answered and unanswered questions', () => {
    expect(calculateTrainingStats([])).toStrictEqual({
      totalQuestions: 0,
      answeredQuestions: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
    });
  });
});
