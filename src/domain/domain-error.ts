export type DomainErrorCode =
  | 'empty_favorites_training'
  | 'answer_does_not_belong_to_item'
  | 'training_not_found'
  | 'training_already_finished'
  | 'training_item_not_found'
  | 'training_item_already_answered'
  | 'exam_training_answer_not_allowed'
  | 'item_not_found';

const domainErrorMessages: Record<DomainErrorCode, string> = {
  empty_favorites_training: 'Cannot create favorites training without favorite items.',
  answer_does_not_belong_to_item: 'Answer does not belong to item.',
  training_not_found: 'Training was not found.',
  training_already_finished: 'Training is already finished.',
  training_item_not_found: 'Training item was not found.',
  training_item_already_answered: 'Training item is already answered.',
  exam_training_answer_not_allowed: 'Use exam answer use-case for exam training.',
  item_not_found: 'Item was not found.',
};

export class DomainError extends Error {
  public readonly code: DomainErrorCode;

  constructor(code: DomainErrorCode) {
    super(domainErrorMessages[code]);
    this.name = 'DomainError';
    this.code = code;
  }
}

export function isDomainError(error: unknown): error is DomainError {
  return error instanceof DomainError;
}
