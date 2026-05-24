import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const mockSignUp = vi.fn();

vi.mock('../../api', () => ({
  signUp: (...args: unknown[]) => mockSignUp(...args),
}));

import { useSignUp } from '../use-auth';

describe('useSignUp', () => {
  beforeEach(() => {
    mockSignUp.mockReset();
  });

  it('returns false and isSuccess=true when session is null (email confirmation pending)', async () => {
    mockSignUp.mockResolvedValue({ user: { id: '1' }, session: null });

    const { result } = renderHook(() => useSignUp());

    let hasSession: boolean | undefined;
    await act(async () => {
      hasSession = await result.current.signUp('a@b.com', '123456', 'John');
    });

    expect(hasSession).toBe(false);
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('returns true and isSuccess=true when session exists', async () => {
    mockSignUp.mockResolvedValue({
      user: { id: '1' },
      session: { access_token: 'tok' },
    });

    const { result } = renderHook(() => useSignUp());

    let hasSession: boolean | undefined;
    await act(async () => {
      hasSession = await result.current.signUp('a@b.com', '123456', 'John');
    });

    expect(hasSession).toBe(true);
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('sets error and keeps isSuccess=false when signUp throws', async () => {
    mockSignUp.mockRejectedValue(new Error('User already registered'));

    const { result } = renderHook(() => useSignUp());

    await act(async () => {
      try {
        await result.current.signUp('a@b.com', '123456', 'John');
      } catch {
        // expected
      }
    });

    expect(result.current.isSuccess).toBe(false);
    expect(result.current.error).toBe('User already registered');
  });

  it('clears error and resets isSuccess on new attempt', async () => {
    mockSignUp.mockRejectedValueOnce(new Error('First error'));

    const { result } = renderHook(() => useSignUp());

    await act(async () => {
      try {
        await result.current.signUp('a@b.com', '123456', 'John');
      } catch {
        // expected
      }
    });

    expect(result.current.error).toBe('First error');
    expect(result.current.isSuccess).toBe(false);

    mockSignUp.mockResolvedValue({ user: { id: '1' }, session: null });

    await act(async () => {
      await result.current.signUp('a@b.com', '123456', 'John');
    });

    expect(result.current.error).toBeNull();
    expect(result.current.isSuccess).toBe(true);
  });
});
