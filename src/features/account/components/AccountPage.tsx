import { useTranslation } from 'react-i18next';
import { AccountSection } from './AccountSection';
import { ChangePasswordForm } from './ChangePasswordForm';
import { DeleteAccountDialog } from './DeleteAccountDialog';

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
  onOpenDeleteDialog: () => void;
  onCloseDeleteDialog: () => void;
  onDeleteAccount: () => void;
  showDeleteDialog: boolean;
  isDeletingAccount: boolean;
  deleteAccountError: string | null;
  isDemoUser?: boolean;
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
  onOpenDeleteDialog,
  onCloseDeleteDialog,
  onDeleteAccount,
  showDeleteDialog,
  isDeletingAccount,
  deleteAccountError,
  isDemoUser,
}: AccountPageProps) {
  const { t } = useTranslation('account');

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        {t('heading')}
      </h1>
      {isDemoUser && (
        <p className="mb-4 text-sm text-amber-600 dark:text-amber-400">
          {t('demo.restricted')}
        </p>
      )}

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
          isDemoUser={isDemoUser}
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
          isDemoUser={isDemoUser}
        />
      </section>

      {/* Section 3 — Danger Zone */}
      <section className={`${CARD} border border-red-200 dark:border-red-900`}>
        <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
          {t('dangerZone.heading')}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {t('dangerZone.description')}
        </p>
        <button
          type="button"
          onClick={onOpenDeleteDialog}
          disabled={isDemoUser}
          className="cursor-pointer rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('dangerZone.deleteButton')}
        </button>
      </section>

      <DeleteAccountDialog
        isOpen={showDeleteDialog}
        onConfirm={onDeleteAccount}
        onCancel={onCloseDeleteDialog}
        isPending={isDeletingAccount}
        error={deleteAccountError}
      />
    </div>
  );
}
