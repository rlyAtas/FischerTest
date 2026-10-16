/**
 * Проверяет правильность выбранного ответа на вопрос
 * Если ответ не принадлежит вопросу, выбрасывает ошибку приложения.
 */

import { AppError } from '../errors/app-error';

export type AnswerForChecking = {
  id: number;
  isCorrect: boolean;
};

export type ItemForChecking = {
  id: number;
  answers: AnswerForChecking[];
};

export function checkSelectedAnswer(item: ItemForChecking, answerId: number): boolean {
  const answer = item.answers.find((answer) => answer.id === answerId);

  if (!answer) {
    throw new AppError('answer_does_not_belong_to_item');
  }

  return answer.isCorrect;
}
