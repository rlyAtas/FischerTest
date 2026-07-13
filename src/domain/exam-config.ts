export type ExamConfig = {
  stateCode: 'NRW';
  totalQuestions: number;
  questionsPerTopic: number;
  minCorrectAnswersTotal: number;
  minCorrectAnswersPerTopic: number;
};

export const nrwExamConfig: ExamConfig = {
  stateCode: 'NRW',
  totalQuestions: 60,
  questionsPerTopic: 10,
  minCorrectAnswersTotal: 45,
  minCorrectAnswersPerTopic: 6,
};
