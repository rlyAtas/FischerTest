export type AppErrorCode =
  | 'empty_favorites_training'
  | 'answer_does_not_belong_to_item'
  | 'training_not_found'
  | 'training_is_not_exam'
  | 'training_already_finished'
  | 'training_item_not_found'
  | 'training_item_already_answered'
  | 'training_type_not_supported'
  | 'invalid_training_item_answer'
  | 'item_not_found';

const appErrorMessages: Record<AppErrorCode, string> = {
  empty_favorites_training: 'Cannot create favorites training without favorite items.',
  answer_does_not_belong_to_item: 'Answer does not belong to item.',
  training_not_found: 'Training was not found.',
  training_is_not_exam: 'Training is not an exam.',
  training_already_finished: 'Training is already finished.',
  training_item_not_found: 'Training item was not found.',
  training_item_already_answered: 'Training item is already answered.',
  training_type_not_supported: 'Training type is not supported by this use-case.',
  invalid_training_item_answer: 'Saved training item answer is incomplete.',
  item_not_found: 'Item was not found.',
};

/**
 * Ожидаемая ошибка приложения с кодом для обработки в вызывающем коде.
 */
export class AppError extends Error {
  public readonly code: AppErrorCode;

  constructor(code: AppErrorCode) {
    super(appErrorMessages[code]);
    this.name = 'AppError';
    this.code = code;
  }
}

/**
 * Определяет, является ли значение ожидаемой ошибкой приложения.
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
