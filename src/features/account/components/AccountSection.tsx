import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AvatarUpload } from './AvatarUpload';

const DEFAULT_AVATAR = '/image-noPhotoPerfil.png';

interface AccountSectionProps {
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
}

export function AccountSection({
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
}: AccountSectionProps) {
  const { t } = useTranslation('account');
  // Track only user edits — null means "use prop value"
  const [editValue, setEditValue] = useState<string | null>(null);
  const name = editValue ?? displayName ?? '';
  const isDirty = editValue !== null;

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEditValue(e.target.value);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSaveDisplayName(name.trim());
    setEditValue(null);
  }

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <AvatarUpload
        avatarUrl={avatarUrl ?? DEFAULT_AVATAR}
        onUpload={onUploadAvatar}
        isPending={isUploadingAvatar}
        error={uploadAvatarError}
        hasCustomAvatar={hasCustomAvatar}
        onRemove={onRemoveAvatar}
        isRemoving={isRemovingAvatar}
      />

      {/* Display name */}
      <form onSubmit={handleSave} className="space-y-2">
        <label
          htmlFor="display-name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t('profile.displayName')}
        </label>
        <div className="flex gap-2">
          <input
            id="display-name"
            type="text"
            value={name}
            onChange={handleNameChange}
            placeholder={t('profile.namePlaceholder')}
            maxLength={100}
            aria-describedby={saveNameError ? 'name-error' : undefined}
            aria-invalid={!!saveNameError}
            className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={isSavingName || !isDirty || !name.trim()}
            className="cursor-pointer rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSavingName ? t('common:action.saving') : t('common:action.save')}
          </button>
        </div>
        {saveNameError && (
          <p
            id="name-error"
            className="text-xs text-red-600 dark:text-red-400"
            role="alert"
          >
            {saveNameError}
          </p>
        )}
      </form>

      {/* Email (readonly) */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
          {t('profile.email')}
        </p>
        <p className="text-sm text-gray-900 dark:text-gray-100">{email}</p>
      </div>
    </div>
  );
}
