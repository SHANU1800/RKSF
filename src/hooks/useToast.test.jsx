import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToast } from './useToast';

describe('useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('adds and removes toast manually', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.success('Saved');
    });

    expect(result.current.toasts).toHaveLength(1);

    act(() => {
      result.current.removeToast(result.current.toasts[0].id);
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it('auto-dismisses after duration', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.info('Hi', 1000);
    });

    expect(result.current.toasts).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.toasts).toHaveLength(0);
  });
});












