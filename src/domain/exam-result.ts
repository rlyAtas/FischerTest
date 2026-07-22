import type { ExamConfig } from './exam-config';

export type ExamAnswerResult = {
  topicId: number;
  isCorrect: boolean | null;
};

export type ExamFailureReason =
  | {
      code: 'not_enough_total_correct_answers';
      correctAnswersTotal: number;
      requiredCorrectAnswersTotal: number;
    }
  | {
      code: 'not_enough_topic_correct_answers';
      failedTopicIds: number[];
      requiredCorrectAnswersPerTopic: number;
    };

export type ExamResult = {
  correctAnswersTotal: number;
  correctAnswersByTopic: Record<number, number>;
  passed: boolean;
  failureReason: ExamFailureReason | null;
};

export function calculateExamResult(answers: readonly ExamAnswerResult[], config: ExamConfig): ExamResult {
  const correctAnswersByTopic: Record<number, number> = {};

  for (const answer of answers) {
    correctAnswersByTopic[answer.topicId] ??= 0;

    if (answer.isCorrect === true) {
      correctAnswersByTopic[answer.topicId] += 1;
    }
  }

  const correctAnswersTotal = Object.values(correctAnswersByTopic).reduce(
    (totalCorrectAnswers, topicCorrectAnswers) => totalCorrectAnswers + topicCorrectAnswers,
    0,
  );

  if (correctAnswersTotal < config.minCorrectAnswersTotal) {
    return {
      correctAnswersTotal,
      correctAnswersByTopic,
      passed: false,
      failureReason: {
        code: 'not_enough_total_correct_answers',
        correctAnswersTotal,
        requiredCorrectAnswersTotal: config.minCorrectAnswersTotal,
      },
    };
  }

  const failedTopicIds = Object.entries(correctAnswersByTopic)
    .filter(([, correctAnswers]) => correctAnswers < config.minCorrectAnswersPerTopic)
    .map(([topicId]) => Number(topicId));

  if (failedTopicIds.length > 0) {
    return {
      correctAnswersTotal,
      correctAnswersByTopic,
      passed: false,
      failureReason: {
        code: 'not_enough_topic_correct_answers',
        failedTopicIds,
        requiredCorrectAnswersPerTopic: config.minCorrectAnswersPerTopic,
      },
    };
  }

  return {
    correctAnswersTotal,
    correctAnswersByTopic,
    passed: true,
    failureReason: null,
  };
}
