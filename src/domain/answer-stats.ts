export type Answer = {
  isCorrect: boolean | null;
};

export type TrainingStats = {
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  unansweredQuestions: number;
};

export function calculateAnswerStats(answers: readonly Answer[]): TrainingStats {
  return {
    totalQuestions: answers.length,
    answeredQuestions: answers.filter((answer) => answer.isCorrect !== null).length,
    correctAnswers: answers.filter((answer) => answer.isCorrect === true).length,
    wrongAnswers: answers.filter((answer) => answer.isCorrect === false).length,
    unansweredQuestions: answers.filter((answer) => answer.isCorrect === null).length,
  };
}
