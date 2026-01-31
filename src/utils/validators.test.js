import { describe, it, expect } from 'vitest';
import { validators } from './errorHandler';

describe('validators', () => {
  it('validates email', () => {
    expect(validators.email('a@b.com')).toBeNull();
    expect(validators.email('bad')).toBe('Invalid email address');
  });

  it('validates password strength', () => {
    expect(validators.password('Abcdef12')).toBeNull();
    expect(validators.password('short')).toMatch('at least 8');
  });

  it('validates phone', () => {
    expect(validators.phone('1234567890')).toBeNull();
    expect(validators.phone('12')).toBe('Phone must be 10 digits');
  });

  it('validates upiId', () => {
    expect(validators.upiId('user@upi')).toBeNull();
    expect(validators.upiId('bad@')).toBe('Invalid UPI ID format');
  });

  it('validates required', () => {
    expect(validators.required('ok')).toBeNull();
    expect(validators.required('')).toBe('This field is required');
  });
});
