import { vi, describe, it, expect, beforeEach } from 'vitest';

const mockSignInWithOAuth = vi.fn();

vi.mock('@/shared/services/supabase', () => ({
  supabase: {
    auth: {
      signInWithOAuth: (...args: unknown[]) => mockSignInWithOAuth(...args),
    },
  },
}));

import { getOAuthRedirectTo, signInWithGoogle } from '../auth.api';

describe('getOAuthRedirectTo', () => {
  it('returns origin + /app', () => {
    expect(getOAuthRedirectTo()).toBe(`${window.location.origin}/app`);
  });
});

describe('signInWithGoogle', () => {
  beforeEach(() => {
    mockSignInWithOAuth.mockReset();
  });

  it('calls signInWithOAuth with google provider and redirectTo', async () => {
    mockSignInWithOAuth.mockResolvedValue({ data: {}, error: null });

    await signInWithGoogle();

    expect(mockSignInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/app` },
    });
  });

  it('throws when supabase returns an error', async () => {
    mockSignInWithOAuth.mockResolvedValue({
      data: null,
      error: { message: 'Provider not enabled' },
    });

    await expect(signInWithGoogle()).rejects.toThrow('Provider not enabled');
  });
});
