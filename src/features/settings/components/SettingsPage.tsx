import type {
  RetentionPolicy,
  ThemePreference,
} from '@/shared/types/preferences.types';
import { RetentionPolicySelect } from '@/shared/components/RetentionPolicySelect';
import { ThemeSelector } from './ThemeSelector';
import { AccountSection } from './AccountSection';
import { ChangePasswordForm } from './ChangePasswordForm';

interface SettingsPageProps {
  theme: ThemePreference;
  onThemeChange: (theme: ThemePreference) => void;
  retentionPolicy: RetentionPolicy;
  onRetentionPolicyChange: (policy: RetentionPolicy) => void;
  userEmail: string;
  onSignOut: () => void;
  isSigningOut: boolean;
  remindersEnabled: boolean;
  onToggleReminders: () => void;
  displayName: string | null;
  avatarUrl: string | null;
  hasCustomAvatar: boolean;
  onSaveDisplayName: (name: string) => void;
  isSavingName: boolean;
  saveNameError: string | null;
  onUploadAvatar: (file: File) => void;
  isUploadingAvatar: boolean;
  onRemoveAvatar: () => void;
  isRemovingAvatar: boolean;
  uploadAvatarError: string | null;
  onChangePassword: (password: string) => void;
  isChangingPassword: boolean;
  changePasswordError: string | null;
  changePasswordSuccess: boolean;
  onResetChangePassword: () => void;
}

const CARD = 'bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm';

export function SettingsPage({
  theme,
  onThemeChange,
  retentionPolicy,
  onRetentionPolicyChange,
  userEmail,
  onSignOut,
  isSigningOut,
  remindersEnabled,
  onToggleReminders,
  displayName,
  avatarUrl,
  hasCustomAvatar,
  onSaveDisplayName,
  isSavingName,
  saveNameError,
  onUploadAvatar,
  isUploadingAvatar,
  onRemoveAvatar,
  isRemovingAvatar,
  uploadAvatarError,
  onChangePassword,
  isChangingPassword,
  changePasswordError,
  changePasswordSuccess,
  onResetChangePassword,
}: SettingsPageProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        Settings
      </h1>

      {/* Section 1 — Appearance */}
      <section className={CARD}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Appearance
        </h2>
        <ThemeSelector theme={theme} onThemeChange={onThemeChange} />
      </section>

      {/* Section 2 — Data Retention */}
      <section className={CARD}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Data Retention
        </h2>
        <label
          htmlFor="retention-policy"
          className="flex flex-col gap-2 text-sm text-gray-700 dark:text-gray-300"
        >
          Automatically archive completed tasks after:
          <RetentionPolicySelect
            id="retention-policy"
            retentionPolicy={retentionPolicy}
            onRetentionChange={onRetentionPolicyChange}
          />
        </label>
      </section>

      {/* Section 3 — Notifications */}
      <section className={CARD}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Notifications
        </h2>
        <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={remindersEnabled}
            onChange={onToggleReminders}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          Due date reminders
        </label>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Show popup reminders for tasks that are overdue or due soon.
        </p>
      </section>

      {/* Section 4 — Account */}
      <section className={CARD}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Account
        </h2>
        <AccountSection
          email={userEmail}
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
          onSignOut={onSignOut}
          isSigningOut={isSigningOut}
        />
      </section>

      {/* Section 5 — Change Password */}
      <section className={CARD}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Change Password
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
