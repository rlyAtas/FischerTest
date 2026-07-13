import { describe, expect, it } from 'vitest';

import { nrwExamConfig } from '../../../src/domain/exam-config';

describe('nrwExamConfig', () => {
  it('describes NRW exam rules', () => {
    expect(nrwExamConfig).toStrictEqual({
      stateCode: 'NRW',
      totalQuestions: 60,
      questionsPerTopic: 10,
      minCorrectAnswersTotal: 45,
      minCorrectAnswersPerTopic: 6,
    });
  });
});
