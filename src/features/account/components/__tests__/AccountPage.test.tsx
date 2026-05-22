import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AccountPage } from '../AccountPage';

const defaultProps = {
  email: 'test@example.com',
  displayName: 'John Doe',
  avatarUrl: null,
  hasCustomAvatar: false,
  onSaveDisplayName: vi.fn(),
  isSavingName: false,
  saveNameError: null,
  onUploadAvatar: vi.fn(),
  isUploadingAvatar: false,
  uploadAvatarError: null,
  onRemoveAvatar: vi.fn(),
  isRemovingAvatar: false,
  onChangePassword: vi.fn(),
  isChangingPassword: false,
  changePasswordError: null,
  changePasswordSuccess: false,
  onResetChangePassword: vi.fn(),
  onOpenDeleteDialog: vi.fn(),
  onCloseDeleteDialog: vi.fn(),
  onDeleteAccount: vi.fn(),
  showDeleteDialog: false,
  isDeletingAccount: false,
  deleteAccountError: null,
};

describe('AccountPage', () => {
  it('renders the Account heading', () => {
    render(<AccountPage {...defaultProps} />);

    expect(
      screen.getByRole('heading', { level: 1, name: /account/i }),
    ).toBeInTheDocument();
  });

  it('renders the Profile section', () => {
    render(<AccountPage {...defaultProps} />);

    expect(
      screen.getByRole('heading', { level: 2, name: /profile/i }),
    ).toBeInTheDocument();
  });

  it('renders the Change Password section', () => {
    render(<AccountPage {...defaultProps} />);

    expect(
      screen.getByRole('heading', { level: 2, name: /change password/i }),
    ).toBeInTheDocument();
  });

  it('renders the user email', () => {
    render(<AccountPage {...defaultProps} />);

    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('does not render a sign out button', () => {
    render(<AccountPage {...defaultProps} />);

    expect(
      screen.queryByRole('button', { name: /sign out/i }),
    ).not.toBeInTheDocument();
  });
});
