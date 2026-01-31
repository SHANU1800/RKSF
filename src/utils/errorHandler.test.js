import { describe, it, expect } from 'vitest';
import { handleApiError, isNetworkError, isValidationError, isAuthError } from './errorHandler';

describe('handleApiError', () => {
  it('returns response-based error details', () => {
    const error = { response: { status: 500, data: { error: 'Oops' } } };
    expect(handleApiError(error)).toEqual({
      status: 500,
      message: 'Oops',
      details: undefined,
    });
  });

  it('handles network errors (no response)', () => {
    const error = { request: {} };
    expect(handleApiError(error)).toEqual({
      status: 0,
      message: 'No response from server. Check your connection.',
      details: null,
    });
  });

  it('handles setup errors', () => {
    const error = { message: 'Bad config' };
    expect(handleApiError(error)).toEqual({
      status: -1,
      message: 'Bad config',
      details: null,
    });
  });
});

describe('error helpers', () => {
  it('detects network errors', () => {
    expect(isNetworkError({ request: {} })).toBe(true);
    expect(isNetworkError({ response: {} })).toBe(false);
  });

  it('detects validation errors', () => {
    expect(isValidationError({ response: { status: 400 } })).toBe(true);
    expect(isValidationError({ response: { status: 409 } })).toBe(true);
    expect(isValidationError({ response: { status: 500 } })).toBe(false);
  });

  it('detects auth errors', () => {
    expect(isAuthError({ response: { status: 401 } })).toBe(true);
    expect(isAuthError({ response: { status: 403 } })).toBe(true);
    expect(isAuthError({ response: { status: 404 } })).toBe(false);
  });
});
