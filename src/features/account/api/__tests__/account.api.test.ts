import { describe, expect, it, vi, beforeEach } from 'vitest';
import { deleteAccount } from '../account.api';

const mockInvoke = vi.fn();

vi.mock('@/shared/services/supabase', () => ({
  supabase: {
    functions: { invoke: (...args: unknown[]) => mockInvoke(...args) },
  },
}));

describe('deleteAccount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls supabase.functions.invoke with correct args', async () => {
    mockInvoke.mockResolvedValue({ data: { success: true }, error: null });

    await deleteAccount();

    expect(mockInvoke).toHaveBeenCalledWith('delete-account', {
      method: 'POST',
    });
  });

  it('resolves on success', async () => {
    mockInvoke.mockResolvedValue({ data: { success: true }, error: null });

    await expect(deleteAccount()).resolves.toBeUndefined();
  });

  it('throws on invoke-level error', async () => {
    mockInvoke.mockResolvedValue({
      data: null,
      error: { message: 'Network error' },
    });

    await expect(deleteAccount()).rejects.toThrow('Network error');
  });

  it('throws on function-level error response', async () => {
    mockInvoke.mockResolvedValue({
      data: { error: 'Account deletion failed. Please try again.' },
      error: null,
    });

    await expect(deleteAccount()).rejects.toThrow(
      'Account deletion failed. Please try again.',
    );
  });
});
