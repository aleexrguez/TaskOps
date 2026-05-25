import { vi, describe, it, expect, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';

vi.mock('@/features/auth/hooks', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '@/features/auth/hooks';
import { useIsDemoUser } from '../use-is-demo-user';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('useIsDemoUser', () => {
  it('returns true when user email matches VITE_DEMO_EMAIL', () => {
    vi.stubEnv('VITE_DEMO_EMAIL', 'demo@example.com');
    vi.mocked(useAuth).mockReturnValue({
      user: { email: 'demo@example.com' } as ReturnType<typeof useAuth>['user'],
      session: null,
      isLoading: false,
    });

    const { result } = renderHook(() => useIsDemoUser());

    expect(result.current).toBe(true);
  });

  it('returns false when email is different', () => {
    vi.stubEnv('VITE_DEMO_EMAIL', 'demo@example.com');
    vi.mocked(useAuth).mockReturnValue({
      user: { email: 'other@example.com' } as ReturnType<
        typeof useAuth
      >['user'],
      session: null,
      isLoading: false,
    });

    const { result } = renderHook(() => useIsDemoUser());

    expect(result.current).toBe(false);
  });

  it('returns false when VITE_DEMO_EMAIL is not defined', () => {
    vi.stubEnv('VITE_DEMO_EMAIL', undefined as unknown as string);
    vi.mocked(useAuth).mockReturnValue({
      user: { email: 'demo@example.com' } as ReturnType<typeof useAuth>['user'],
      session: null,
      isLoading: false,
    });

    const { result } = renderHook(() => useIsDemoUser());

    expect(result.current).toBe(false);
  });

  it('returns false when there is no user', () => {
    vi.stubEnv('VITE_DEMO_EMAIL', 'demo@example.com');
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      isLoading: false,
    });

    const { result } = renderHook(() => useIsDemoUser());

    expect(result.current).toBe(false);
  });
});
