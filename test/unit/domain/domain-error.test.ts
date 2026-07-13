import { describe, expect, it } from 'vitest';

import { DomainError, isDomainError } from '../../../src/domain/domain-error';

describe('DomainError', () => {
  it('creates a domain error with code and message', () => {
    const error = new DomainError('empty_favorites_training');

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('DomainError');
    expect(error.code).toBe('empty_favorites_training');
    expect(error.message).toBe('Cannot create favorites training without favorite items.');
  });

  it('creates answer ownership domain error with code and message', () => {
    const error = new DomainError('answer_does_not_belong_to_item');

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('DomainError');
    expect(error.code).toBe('answer_does_not_belong_to_item');
    expect(error.message).toBe('Answer does not belong to item.');
  });

  it('detects domain errors', () => {
    expect(isDomainError(new DomainError('empty_favorites_training'))).toBe(true);
    expect(isDomainError(new Error('Unexpected error'))).toBe(false);
    expect(isDomainError(null)).toBe(false);
  });
});
