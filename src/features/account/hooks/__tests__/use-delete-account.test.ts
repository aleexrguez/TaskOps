import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDeleteAccount } from '../use-delete-account';

const mockDeleteAccount = vi.fn();

vi.mock('../../api/account.api', () => ({
  deleteAccount: (...args: unknown[]) => mockDeleteAccount(...args),
}));

describe('useDeleteAccount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts with isPending false and no error', () => {
    const { result } = renderHook(() => useDeleteAccount());

    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('returns true on success', async () => {
    mockDeleteAccount.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteAccount());
    let success: boolean;

    await act(async () => {
      success = await result.current.deleteAccount();
    });

    expect(success!).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.isPending).toBe(false);
  });

  it('returns false and sets error on failure', async () => {
    mockDeleteAccount.mockRejectedValue(new Error('Server error'));

    const { result } = renderHook(() => useDeleteAccount());
    let success: boolean;

    await act(async () => {
      success = await result.current.deleteAccount();
    });

    expect(success!).toBe(false);
    expect(result.current.error).toBe('Server error');
    expect(result.current.isPending).toBe(false);
  });

  it('sets generic error for non-Error throws', async () => {
    mockDeleteAccount.mockRejectedValue('unknown');

    const { result } = renderHook(() => useDeleteAccount());

    await act(async () => {
      await result.current.deleteAccount();
    });

    expect(result.current.error).toBe('Failed to delete account');
  });

  it('reset clears error', async () => {
    mockDeleteAccount.mockRejectedValue(new Error('fail'));

    const { result } = renderHook(() => useDeleteAccount());

    await act(async () => {
      await result.current.deleteAccount();
    });

    expect(result.current.error).toBe('fail');

    act(() => {
      result.current.reset();
    });

    expect(result.current.error).toBeNull();
  });
});
