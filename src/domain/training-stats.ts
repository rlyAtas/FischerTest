export type Answer = {
  isCorrect: boolean | null;
};

export type TrainingStats = {
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
};

export function calculateTrainingStats(answers: readonly Answer[]): TrainingStats {
  return {
    totalQuestions: answers.length,
    answeredQuestions: answers.filter((answer) => answer.isCorrect !== null).length,
    correctAnswers: answers.filter((answer) => answer.isCorrect === true).length,
    wrongAnswers: answers.filter((answer) => answer.isCorrect === false).length,
  };
}
