import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useAuth } from '@/features/auth/hooks';
import { useIsDemoUser } from '@/shared/hooks/use-is-demo-user';
import { AccountContainer } from '../AccountContainer';

const mockNavigate = vi.fn();
const mockQueryClientClear = vi.fn();
const mockDeleteAccount = vi.fn();
const mockSignOut = vi.fn();
const mockAddToast = vi.fn();
const mockUpdateProfileMutate = vi.fn();
const mockUploadAvatarMutate = vi.fn();
const mockRemoveAvatarMutate = vi.fn();
const mockChangePassword = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('@/features/auth/hooks', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/shared/hooks/use-is-demo-user', () => ({
  useIsDemoUser: vi.fn(() => false),
}));

vi.mock('@/features/auth/api', () => ({
  signOut: (...args: unknown[]) => mockSignOut(...args),
}));

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ clear: mockQueryClientClear }),
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
    selector({ addToast: mockAddToast, removeToast: vi.fn(), toasts: [] }),
  ),
}));

vi.mock('../../hooks/use-profile', () => ({
  useProfile: vi.fn(() => ({ data: null, isLoading: false })),
  useUpdateProfile: vi.fn(() => ({
    mutate: mockUpdateProfileMutate,
    isPending: false,
    isError: false,
    error: null,
  })),
  useUploadAvatar: vi.fn(() => ({
    mutate: mockUploadAvatarMutate,
    isPending: false,
    isError: false,
    error: null,
  })),
  useRemoveAvatar: vi.fn(() => ({
    mutate: mockRemoveAvatarMutate,
    isPending: false,
    isError: false,
    error: null,
  })),
}));

vi.mock('../../hooks/use-change-password', () => ({
  useChangePassword: vi.fn(() => ({
    changePassword: mockChangePassword,
    isPending: false,
    error: null,
    isSuccess: false,
    reset: vi.fn(),
  })),
}));

vi.mock('../../hooks/use-delete-account', () => ({
  useDeleteAccount: () => ({
    deleteAccount: mockDeleteAccount,
    isPending: false,
    error: null,
    reset: vi.fn(),
  }),
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

  mockSignOut.mockResolvedValue(undefined);
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

  it('renders the Danger Zone section', () => {
    render(<AccountContainer />);

    expect(
      screen.getByRole('heading', { level: 2, name: /danger zone/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /delete account/i }),
    ).toBeInTheDocument();
  });

  it('opens delete dialog when delete button is clicked', async () => {
    const user = userEvent.setup();
    render(<AccountContainer />);

    await user.click(screen.getByRole('button', { name: /delete account/i }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes delete dialog on cancel', async () => {
    const user = userEvent.setup();
    render(<AccountContainer />);

    await user.click(screen.getByRole('button', { name: /delete account/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls deleteAccount, clears cache, signs out, and navigates on success', async () => {
    mockDeleteAccount.mockResolvedValue(true);
    const user = userEvent.setup();
    render(<AccountContainer />);

    await user.click(screen.getByRole('button', { name: /delete account/i }));

    const input = screen.getByPlaceholderText('DELETE');
    await user.type(input, 'DELETE');

    const confirmButtons = screen.getAllByRole('button', {
      name: /delete account/i,
    });
    const dialogConfirmButton = confirmButtons.find(
      (btn) => btn.closest('[role="dialog"]') !== null,
    )!;
    await user.click(dialogConfirmButton);

    await waitFor(() => {
      expect(mockDeleteAccount).toHaveBeenCalledOnce();
      expect(mockQueryClientClear).toHaveBeenCalledOnce();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('navigates home even if signOut fails', async () => {
    mockDeleteAccount.mockResolvedValue(true);
    mockSignOut.mockRejectedValue(new Error('User already deleted'));
    const user = userEvent.setup();
    render(<AccountContainer />);

    await user.click(screen.getByRole('button', { name: /delete account/i }));

    const input = screen.getByPlaceholderText('DELETE');
    await user.type(input, 'DELETE');

    const confirmButtons = screen.getAllByRole('button', {
      name: /delete account/i,
    });
    const dialogConfirmButton = confirmButtons.find(
      (btn) => btn.closest('[role="dialog"]') !== null,
    )!;
    await user.click(dialogConfirmButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('does not navigate on deletion failure', async () => {
    mockDeleteAccount.mockResolvedValue(false);
    const user = userEvent.setup();
    render(<AccountContainer />);

    await user.click(screen.getByRole('button', { name: /delete account/i }));

    const input = screen.getByPlaceholderText('DELETE');
    await user.type(input, 'DELETE');

    const confirmButtons = screen.getAllByRole('button', {
      name: /delete account/i,
    });
    const dialogConfirmButton = confirmButtons.find(
      (btn) => btn.closest('[role="dialog"]') !== null,
    )!;
    await user.click(dialogConfirmButton);

    await waitFor(() => {
      expect(mockDeleteAccount).toHaveBeenCalledOnce();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockQueryClientClear).not.toHaveBeenCalled();
  });
});

describe('AccountContainer — demo user blocking', () => {
  beforeEach(() => {
    vi.mocked(useIsDemoUser).mockReturnValue(true);
  });

  it('disables display name input and save button for demo user', () => {
    render(<AccountContainer />);

    const input = screen.getByRole('textbox', { name: /display name/i });
    const saveButton = screen.getByRole('button', { name: /save/i });

    expect(input).toBeDisabled();
    expect(saveButton).toBeDisabled();
  });

  it('disables delete account button for demo user', () => {
    render(<AccountContainer />);

    const deleteButton = screen.getByRole('button', {
      name: /delete account/i,
    });

    expect(deleteButton).toBeDisabled();
  });
});
