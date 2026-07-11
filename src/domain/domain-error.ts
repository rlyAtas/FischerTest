export type DomainErrorCode = 'empty_favorites_training';

const domainErrorMessages: Record<DomainErrorCode, string> = {
  empty_favorites_training: 'Cannot create favorites training without favorite items.',
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
