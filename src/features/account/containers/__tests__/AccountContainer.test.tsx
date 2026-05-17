import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useAuth } from '@/features/auth/hooks';
import { AccountContainer } from '../AccountContainer';

vi.mock('@/features/auth/hooks', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: vi.fn(),
  useQuery: vi.fn(() => ({ data: null, isLoading: false })),
  useMutation: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
  })),
}));

vi.mock('@/shared/store/toast.store', () => ({
  useToastStore: vi.fn((selector) =>
    selector({ addToast: vi.fn(), removeToast: vi.fn(), toasts: [] }),
  ),
}));

vi.mock('../../hooks/use-profile', () => ({
  useProfile: vi.fn(() => ({ data: null, isLoading: false })),
  useUpdateProfile: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
  })),
  useUploadAvatar: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
  })),
  useRemoveAvatar: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
  })),
}));

vi.mock('../../hooks/use-change-password', () => ({
  useChangePassword: vi.fn(() => ({
    changePassword: vi.fn(),
    isPending: false,
    error: null,
    isSuccess: false,
    reset: vi.fn(),
  })),
}));

vi.mock('../../api/profile.api', () => ({
  getAvatarPublicUrl: vi.fn(() => 'https://example.com/avatar.jpg'),
}));

beforeEach(() => {
  vi.clearAllMocks();

  vi.mocked(useAuth).mockReturnValue({
    user: {
      email: 'user@example.com',
    } as unknown as import('@supabase/supabase-js').User,
    session: null,
    isLoading: false,
  });
});

describe('AccountContainer', () => {
  it('renders the Account page heading', () => {
    render(<AccountContainer />);

    expect(
      screen.getByRole('heading', { level: 1, name: /account/i }),
    ).toBeInTheDocument();
  });

  it('renders the user email from auth context', () => {
    render(<AccountContainer />);

    expect(screen.getByText('user@example.com')).toBeInTheDocument();
  });

  it('renders the Profile section', () => {
    render(<AccountContainer />);

    expect(
      screen.getByRole('heading', { level: 2, name: /profile/i }),
    ).toBeInTheDocument();
  });

  it('renders the Change Password section', () => {
    render(<AccountContainer />);

    expect(
      screen.getByRole('heading', { level: 2, name: /change password/i }),
    ).toBeInTheDocument();
  });
});
