import { describe, expect, it } from 'vitest';

import { AppError, type AppErrorCode, isAppError } from '../../../src/errors/app-error';

describe('AppError', () => {
  it.each<{ code: AppErrorCode; message: string }>([
    {
      code: 'empty_favorites_training',
      message: 'Cannot create favorites training without favorite items.',
    },
    {
      code: 'answer_does_not_belong_to_item',
      message: 'Answer does not belong to item.',
    },
  ])('creates an error with code $code and message', ({ code, message }) => {
    const error = new AppError(code);

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('AppError');
    expect(error.code).toBe(code);
    expect(error.message).toBe(message);
  });
});

describe('isAppError', () => {
  it('detects app errors', () => {
    expect(isAppError(new AppError('empty_favorites_training'))).toBe(true);
    expect(isAppError(new Error('Unexpected error'))).toBe(false);
    expect(isAppError(null)).toBe(false);
  });
});
