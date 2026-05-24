import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const mockSignInWithGoogle = vi.fn();

vi.mock('../../api', () => ({
  signInWithGoogle: (...args: unknown[]) => mockSignInWithGoogle(...args),
}));

import { useSignInWithGoogle } from '../use-auth';

describe('useSignInWithGoogle', () => {
  beforeEach(() => {
    mockSignInWithGoogle.mockReset();
  });

  it('starts with isPending=false and error=null', () => {
    const { result } = renderHook(() => useSignInWithGoogle());

    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets isPending=true when initiated', async () => {
    let resolveFn: () => void;
    mockSignInWithGoogle.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveFn = resolve;
      }),
    );

    const { result } = renderHook(() => useSignInWithGoogle());

    act(() => {
      result.current.signInWithGoogle();
    });

    expect(result.current.isPending).toBe(true);
    expect(result.current.error).toBeNull();

    await act(async () => {
      resolveFn!();
    });
  });

  it('clears previous error on new attempt', async () => {
    mockSignInWithGoogle.mockRejectedValueOnce(new Error('First error'));

    const { result } = renderHook(() => useSignInWithGoogle());

    await act(async () => {
      await result.current.signInWithGoogle();
    });

    expect(result.current.error).toBe('First error');

    let resolveFn: () => void;
    mockSignInWithGoogle.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveFn = resolve;
      }),
    );

    act(() => {
      result.current.signInWithGoogle();
    });

    expect(result.current.error).toBeNull();

    await act(async () => {
      resolveFn!();
    });
  });

  it('keeps isPending=true on success (browser redirects away)', async () => {
    mockSignInWithGoogle.mockResolvedValue(undefined);

    const { result } = renderHook(() => useSignInWithGoogle());

    await act(async () => {
      await result.current.signInWithGoogle();
    });

    expect(result.current.isPending).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('sets error and resets isPending on failure', async () => {
    mockSignInWithGoogle.mockRejectedValue(new Error('Provider not enabled'));

    const { result } = renderHook(() => useSignInWithGoogle());

    await act(async () => {
      await result.current.signInWithGoogle();
    });

    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBe('Provider not enabled');
  });

  it('uses fallback message for non-Error throws', async () => {
    mockSignInWithGoogle.mockRejectedValue('unknown');

    const { result } = renderHook(() => useSignInWithGoogle());

    await act(async () => {
      await result.current.signInWithGoogle();
    });

    expect(result.current.error).toBe('Google sign in failed');
  });
});
