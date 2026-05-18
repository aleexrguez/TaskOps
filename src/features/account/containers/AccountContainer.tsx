import { useAuth } from '@/features/auth/hooks';
import { useToastStore } from '@/shared/store/toast.store';
import {
  useProfile,
  useUpdateProfile,
  useUploadAvatar,
  useRemoveAvatar,
} from '../hooks/use-profile';
import { useChangePassword } from '../hooks/use-change-password';
import { getAvatarPublicUrl } from '../api/profile.api';
import { AccountPage } from '../components/AccountPage';

export function AccountContainer() {
  const { user } = useAuth();
  const addToast = useToastStore((s) => s.addToast);

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

  function handleSaveDisplayName(name: string) {
    updateProfile.mutate(
      { display_name: name },
      {
        onSuccess: () => addToast('Display name updated', 'success'),
        onError: (err) =>
          addToast(
            err instanceof Error ? err.message : 'Update failed',
            'error',
          ),
      },
    );
  }

  function handleUploadAvatar(file: File) {
    uploadAvatar.mutate(file, {
      onSuccess: () => addToast('Avatar updated', 'success'),
      onError: (err) =>
        addToast(err instanceof Error ? err.message : 'Upload failed', 'error'),
    });
  }

  function handleRemoveAvatar() {
    removeAvatarMutation.mutate(undefined, {
      onSuccess: () => addToast('Avatar removed', 'success'),
      onError: (err) =>
        addToast(err instanceof Error ? err.message : 'Remove failed', 'error'),
    });
  }

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
            : 'Update failed'
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
            : 'Upload failed'
          : null
      }
      onChangePassword={changePassword}
      isChangingPassword={isChangingPassword}
      changePasswordError={changePasswordError}
      changePasswordSuccess={changePasswordSuccess}
      onResetChangePassword={resetChangePassword}
    />
  );
}
