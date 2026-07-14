import { describe, expect, it } from 'vitest';

import type { ExamConfig } from '../../../src/domain/exam-config';
import { calculateExamResult, type ExamAnswerResult } from '../../../src/domain/exam-result';

const examConfig: ExamConfig = {
  stateCode: 'NRW',
  totalQuestions: 12,
  questionsPerTopic: 4,
  minCorrectAnswersTotal: 9,
  minCorrectAnswersPerTopic: 2,
};

describe('calculateExamResult', () => {
  it('passes exam when total and per-topic thresholds are reached', () => {
    const result = calculateExamResult(
      [
        ...createAnswers(1, [true, true, true, false]),
        ...createAnswers(2, [true, true, true, false]),
        ...createAnswers(3, [true, true, true, false]),
      ],
      examConfig,
    );

    expect(result).toStrictEqual({
      correctAnswersTotal: 9,
      correctAnswersByTopic: {
        1: 3,
        2: 3,
        3: 3,
      },
      passed: true,
      failureReason: null,
    });
  });

  it('fails exam when total correct answers threshold is not reached', () => {
    const result = calculateExamResult(
      [
        ...createAnswers(1, [true, true, false, false]),
        ...createAnswers(2, [true, true, false, false]),
        ...createAnswers(3, [true, true, false, false]),
      ],
      examConfig,
    );

    expect(result).toStrictEqual({
      correctAnswersTotal: 6,
      correctAnswersByTopic: {
        1: 2,
        2: 2,
        3: 2,
      },
      passed: false,
      failureReason: {
        code: 'not_enough_total_correct_answers',
        correctAnswersTotal: 6,
        requiredCorrectAnswersTotal: 9,
      },
    });
  });

  it('fails exam when topic correct answers threshold is not reached', () => {
    const result = calculateExamResult(
      [
        ...createAnswers(1, [true, true, true, true]),
        ...createAnswers(2, [true, true, true, true]),
        ...createAnswers(3, [true, false, false, false]),
      ],
      examConfig,
    );

    expect(result).toStrictEqual({
      correctAnswersTotal: 9,
      correctAnswersByTopic: {
        1: 4,
        2: 4,
        3: 1,
      },
      passed: false,
      failureReason: {
        code: 'not_enough_topic_correct_answers',
        failedTopicIds: [3],
        requiredCorrectAnswersPerTopic: 2,
      },
    });
  });

  it('counts unanswered questions as incorrect answers', () => {
    const result = calculateExamResult(
      [
        ...createAnswers(1, [true, true, true, null]),
        ...createAnswers(2, [true, true, true, null]),
        ...createAnswers(3, [true, true, null, null]),
      ],
      examConfig,
    );

    expect(result.correctAnswersTotal).toBe(8);
    expect(result.correctAnswersByTopic).toStrictEqual({
      1: 3,
      2: 3,
      3: 2,
    });
    expect(result.passed).toBe(false);
    expect(result.failureReason).toStrictEqual({
      code: 'not_enough_total_correct_answers',
      correctAnswersTotal: 8,
      requiredCorrectAnswersTotal: 9,
    });
  });
});

function createAnswers(topicId: number, answers: Array<boolean | null>): ExamAnswerResult[] {
  return answers.map((isCorrect) => ({
    topicId,
    isCorrect,
  }));
}
