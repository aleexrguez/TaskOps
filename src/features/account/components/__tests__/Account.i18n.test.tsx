import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, afterAll } from 'vitest';
import i18n from '@/i18n/i18n';
import { AccountPage } from '../AccountPage';

const defaultProps = {
  email: 'test@example.com',
  displayName: 'John Doe',
  avatarUrl: null,
  hasCustomAvatar: false,
  onSaveDisplayName: () => {},
  isSavingName: false,
  saveNameError: null,
  onUploadAvatar: () => {},
  isUploadingAvatar: false,
  uploadAvatarError: null,
  onRemoveAvatar: () => {},
  isRemovingAvatar: false,
  onChangePassword: () => {},
  isChangingPassword: false,
  changePasswordError: null,
  changePasswordSuccess: false,
  onResetChangePassword: () => {},
  onOpenDeleteDialog: () => {},
  onCloseDeleteDialog: () => {},
  onDeleteAccount: () => {},
  showDeleteDialog: false,
  isDeletingAccount: false,
  deleteAccountError: null,
};

afterAll(async () => {
  await i18n.changeLanguage('en');
});

describe('Account i18n', () => {
  it('renders headings in Spanish when language is es', async () => {
    await act(async () => {
      await i18n.changeLanguage('es');
    });

    render(<AccountPage {...defaultProps} />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Cuenta' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Perfil' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Cambiar contraseña/,
      }),
    ).toBeInTheDocument();
  });
});
