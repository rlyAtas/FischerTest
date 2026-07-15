import { describe, expect, it } from 'vitest';

import { type AnswerStatsItem, calculateAnswerStats } from '../../../src/domain/answer-stats';

describe('calculateAnswerStats', () => {
  it('calculates stats for answered and unanswered questions', () => {
    const answers: AnswerStatsItem[] = [
      { isCorrect: true },
      { isCorrect: false },
      { isCorrect: true },
      { isCorrect: null },
    ];
    expect(calculateAnswerStats(answers)).toStrictEqual({
      totalQuestions: 4,
      answeredQuestions: 3,
      correctAnswers: 2,
      wrongAnswers: 1,
      unansweredQuestions: 1,
    });
  });

  it('calculates zero stats for empty answer list', () => {
    expect(calculateAnswerStats([])).toStrictEqual({
      totalQuestions: 0,
      answeredQuestions: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      unansweredQuestions: 0,
    });
  });
});
