import { useTranslation } from 'react-i18next';
import { AccountSection } from './AccountSection';
import { ChangePasswordForm } from './ChangePasswordForm';

interface AccountPageProps {
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  hasCustomAvatar: boolean;
  onSaveDisplayName: (name: string) => void;
  isSavingName: boolean;
  saveNameError: string | null;
  onUploadAvatar: (file: File) => void;
  isUploadingAvatar: boolean;
  uploadAvatarError: string | null;
  onRemoveAvatar: () => void;
  isRemovingAvatar: boolean;
  onChangePassword: (password: string) => void;
  isChangingPassword: boolean;
  changePasswordError: string | null;
  changePasswordSuccess: boolean;
  onResetChangePassword: () => void;
}

const CARD = 'bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm';

export function AccountPage({
  email,
  displayName,
  avatarUrl,
  hasCustomAvatar,
  onSaveDisplayName,
  isSavingName,
  saveNameError,
  onUploadAvatar,
  isUploadingAvatar,
  uploadAvatarError,
  onRemoveAvatar,
  isRemovingAvatar,
  onChangePassword,
  isChangingPassword,
  changePasswordError,
  changePasswordSuccess,
  onResetChangePassword,
}: AccountPageProps) {
  const { t } = useTranslation('account');

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        {t('heading')}
      </h1>

      {/* Section 1 — Profile */}
      <section className={CARD}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {t('profile.heading')}
        </h2>
        <AccountSection
          email={email}
          displayName={displayName}
          avatarUrl={avatarUrl}
          hasCustomAvatar={hasCustomAvatar}
          onSaveDisplayName={onSaveDisplayName}
          isSavingName={isSavingName}
          saveNameError={saveNameError}
          onUploadAvatar={onUploadAvatar}
          isUploadingAvatar={isUploadingAvatar}
          uploadAvatarError={uploadAvatarError}
          onRemoveAvatar={onRemoveAvatar}
          isRemovingAvatar={isRemovingAvatar}
        />
      </section>

      {/* Section 2 — Change Password */}
      <section className={CARD}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {t('password.heading')}
        </h2>
        <ChangePasswordForm
          onSubmit={onChangePassword}
          isPending={isChangingPassword}
          error={changePasswordError}
          isSuccess={changePasswordSuccess}
          onReset={onResetChangePassword}
        />
      </section>
    </div>
  );
}
