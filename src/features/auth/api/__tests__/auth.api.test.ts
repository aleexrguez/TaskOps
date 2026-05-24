import { vi, describe, it, expect, beforeEach } from 'vitest';

const mockSignInWithOAuth = vi.fn();
const mockSignUp = vi.fn();

vi.mock('@/shared/services/supabase', () => ({
  supabase: {
    auth: {
      signInWithOAuth: (...args: unknown[]) => mockSignInWithOAuth(...args),
      signUp: (...args: unknown[]) => mockSignUp(...args),
    },
  },
}));

import { getOAuthRedirectTo, signInWithGoogle, signUp } from '../auth.api';

describe('getOAuthRedirectTo', () => {
  it('returns origin + /app', () => {
    expect(getOAuthRedirectTo()).toBe(`${window.location.origin}/app`);
  });
});

describe('signUp', () => {
  beforeEach(() => {
    mockSignUp.mockReset();
  });

  it('calls supabase.auth.signUp with email, password, and display_name in options.data', async () => {
    mockSignUp.mockResolvedValue({
      data: { user: { id: '1' }, session: null },
      error: null,
    });

    await signUp('a@b.com', '123456', 'John');

    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'a@b.com',
      password: '123456',
      options: { data: { display_name: 'John' } },
    });
  });

  it('trims the name before sending', async () => {
    mockSignUp.mockResolvedValue({
      data: { user: { id: '1' }, session: null },
      error: null,
    });

    await signUp('a@b.com', '123456', '  John  ');

    expect(mockSignUp).toHaveBeenCalledWith(
      expect.objectContaining({
        options: { data: { display_name: 'John' } },
      }),
    );
  });

  it('throws when supabase returns an error', async () => {
    mockSignUp.mockResolvedValue({
      data: null,
      error: { message: 'User already registered' },
    });

    await expect(signUp('a@b.com', '123456', 'John')).rejects.toThrow(
      'User already registered',
    );
  });

  it('returns data when no error', async () => {
    const mockData = { user: { id: '1' }, session: null };
    mockSignUp.mockResolvedValue({ data: mockData, error: null });

    const result = await signUp('a@b.com', '123456', 'John');

    expect(result).toEqual(mockData);
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
