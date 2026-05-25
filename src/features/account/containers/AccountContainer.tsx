import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/hooks';
import { signOut } from '@/features/auth/api';
import { useToastStore } from '@/shared/store/toast.store';
import { useIsDemoUser } from '@/shared/hooks/use-is-demo-user';
import {
  useProfile,
  useUpdateProfile,
  useUploadAvatar,
  useRemoveAvatar,
} from '../hooks/use-profile';
import { useChangePassword } from '../hooks/use-change-password';
import { useDeleteAccount } from '../hooks/use-delete-account';
import { getAvatarPublicUrl } from '../api/profile.api';
import { AccountPage } from '../components/AccountPage';

export function AccountContainer() {
  const { t } = useTranslation('account');
  const { t: tCommon } = useTranslation('common');
  const { user } = useAuth();
  const isDemoUser = useIsDemoUser();
  const addToast = useToastStore((s) => s.addToast);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const removeAvatarMutation = useRemoveAvatar();
  const {
    changePassword,
    isPending: isChangingPassword,
    error: changePasswordError,
    isSuccess: changePasswordSuccess,
    reset: resetChangePassword,
  } = useChangePassword();

  const {
    deleteAccount,
    isPending: isDeletingAccount,
    error: deleteAccountError,
    reset: resetDeleteAccount,
  } = useDeleteAccount();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  async function handleDeleteAccount() {
    const success = await deleteAccount();
    if (success) {
      queryClient.clear();
      try {
        await signOut();
      } catch {
        // Best-effort — auth user is already deleted
      }
      navigate('/');
    }
  }

  function handleOpenDeleteDialog() {
    if (isDemoUser) {
      addToast(tCommon('demo.actionBlocked'), 'info');
      return;
    }
    resetDeleteAccount();
    setShowDeleteDialog(true);
  }

  function handleCloseDeleteDialog() {
    setShowDeleteDialog(false);
  }

  function handleSaveDisplayName(name: string) {
    if (isDemoUser) {
      addToast(tCommon('demo.actionBlocked'), 'info');
      return;
    }
    updateProfile.mutate(
      { display_name: name },
      {
        onSuccess: () => addToast(t('toast.nameUpdated'), 'success'),
        onError: (err) =>
          addToast(
            err instanceof Error ? err.message : t('toast.updateFailed'),
            'error',
          ),
      },
    );
  }

  function handleUploadAvatar(file: File) {
    if (isDemoUser) {
      addToast(tCommon('demo.actionBlocked'), 'info');
      return;
    }
    uploadAvatar.mutate(file, {
      onSuccess: () => addToast(t('toast.avatarUpdated'), 'success'),
      onError: (err) =>
        addToast(
          err instanceof Error ? err.message : t('toast.uploadFailed'),
          'error',
        ),
    });
  }

  function handleRemoveAvatar() {
    if (isDemoUser) {
      addToast(tCommon('demo.actionBlocked'), 'info');
      return;
    }
    removeAvatarMutation.mutate(undefined, {
      onSuccess: () => addToast(t('toast.avatarRemoved'), 'success'),
      onError: (err) =>
        addToast(
          err instanceof Error ? err.message : t('toast.removeFailed'),
          'error',
        ),
    });
  }

  const handleChangePassword = isDemoUser
    ? () => {
        addToast(tCommon('demo.actionBlocked'), 'info');
        return Promise.resolve();
      }
    : changePassword;

  const avatarUrl = profile?.avatar_path
    ? getAvatarPublicUrl(profile.avatar_path)
    : null;

  return (
    <AccountPage
      email={user?.email ?? ''}
      displayName={profile?.display_name ?? null}
      avatarUrl={avatarUrl}
      hasCustomAvatar={!!profile?.avatar_path}
      onSaveDisplayName={handleSaveDisplayName}
      isSavingName={updateProfile.isPending}
      saveNameError={
        updateProfile.isError
          ? updateProfile.error instanceof Error
            ? updateProfile.error.message
            : t('toast.updateFailed')
          : null
      }
      onUploadAvatar={handleUploadAvatar}
      isUploadingAvatar={uploadAvatar.isPending}
      onRemoveAvatar={handleRemoveAvatar}
      isRemovingAvatar={removeAvatarMutation.isPending}
      uploadAvatarError={
        uploadAvatar.isError
          ? uploadAvatar.error instanceof Error
            ? uploadAvatar.error.message
            : t('toast.uploadFailed')
          : null
      }
      isDemoUser={isDemoUser}
      onChangePassword={handleChangePassword}
      isChangingPassword={isChangingPassword}
      changePasswordError={changePasswordError}
      changePasswordSuccess={changePasswordSuccess}
      onResetChangePassword={resetChangePassword}
      onOpenDeleteDialog={handleOpenDeleteDialog}
      onCloseDeleteDialog={handleCloseDeleteDialog}
      onDeleteAccount={handleDeleteAccount}
      showDeleteDialog={showDeleteDialog}
      isDeletingAccount={isDeletingAccount}
      deleteAccountError={deleteAccountError}
    />
  );
}
