import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';

vi.mock('@/shared/services/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: { getUser: vi.fn() },
  },
}));

import { supabase } from '@/shared/services/supabase';
import { submitFeedback } from '../feedback.api';
import type { SubmitFeedbackInput } from '../../types/feedback.types';

function asFromReturn(
  partial: Record<string, unknown>,
): ReturnType<SupabaseClient['from']> {
  return partial as unknown as ReturnType<SupabaseClient['from']>;
}

const baseInput: SubmitFeedbackInput = {
  message: 'Great app!',
  category: 'feature_request',
  email: 'user@example.com',
};

beforeEach(() => {
  vi.mocked(supabase.from).mockReset();
  vi.mocked(supabase.auth.getUser).mockReset();
});

describe('submitFeedback', () => {
  it('inserts with user_id when getUser returns a user', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: { id: 'user-123' } as never },
      error: null,
    });

    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(supabase.from).mockReturnValue(
      asFromReturn({ insert: mockInsert }),
    );

    await submitFeedback(baseInput);

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'user-123' }),
    );
  });

  it('inserts with user_id: null when getUser returns error/no user', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: null },
      error: { message: 'Not authenticated' } as never,
    });

    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(supabase.from).mockReturnValue(
      asFromReturn({ insert: mockInsert }),
    );

    await submitFeedback(baseInput);

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: null }),
    );
  });

  it("converts empty email '' to null in the insert", async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: null as never },
      error: null,
    });

    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(supabase.from).mockReturnValue(
      asFromReturn({ insert: mockInsert }),
    );

    await submitFeedback({ ...baseInput, email: '' });

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ email: null }),
    );
  });

  it('passes non-empty email through as-is', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: null as never },
      error: null,
    });

    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(supabase.from).mockReturnValue(
      asFromReturn({ insert: mockInsert }),
    );

    await submitFeedback({ ...baseInput, email: 'hello@test.com' });

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'hello@test.com' }),
    );
  });

  it('throws when supabase insert returns an error', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: null as never },
      error: null,
    });

    const mockInsert = vi
      .fn()
      .mockResolvedValue({ error: { message: 'DB error' } });
    vi.mocked(supabase.from).mockReturnValue(
      asFromReturn({ insert: mockInsert }),
    );

    await expect(submitFeedback(baseInput)).rejects.toThrow('DB error');
  });
});
