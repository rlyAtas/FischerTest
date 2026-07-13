import { DomainError } from './domain-error';

export type ItemAnswer = {
  id: number;
  isCorrect: boolean;
};

export type Item = {
  id: number;
  answers: ItemAnswer[];
};

export function checkSelectedAnswer(item: Item, answerId: number): boolean {
  const answer = item.answers.find((answer) => answer.id === answerId);

  if (!answer) {
    throw new DomainError('answer_does_not_belong_to_item');
  }

  return answer.isCorrect;
}
