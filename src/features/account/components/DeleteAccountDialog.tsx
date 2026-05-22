import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';

interface DeleteAccountDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
  error: string | null;
}

const CONFIRMATION_WORD = 'DELETE';

export function DeleteAccountDialog({
  isOpen,
  onConfirm,
  onCancel,
  isPending,
  error,
}: DeleteAccountDialogProps) {
  const { t } = useTranslation('account');
  const [inputValue, setInputValue] = useState('');

  const isConfirmed = inputValue.trim().toUpperCase() === CONFIRMATION_WORD;

  const handleCancel = useCallback(() => {
    setInputValue('');
    onCancel();
  }, [onCancel]);

  return (
    <ConfirmDialog
      isOpen={isOpen}
      title={t('dangerZone.dialog.title')}
      confirmLabel={
        isPending
          ? t('dangerZone.dialog.deleting')
          : t('dangerZone.dialog.confirmButton')
      }
      onConfirm={onConfirm}
      onCancel={handleCancel}
      isLoading={isPending}
      confirmDisabled={!isConfirmed}
      variant="danger"
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {t('dangerZone.dialog.warning')}
        </p>
        <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-300 space-y-1">
          <li>{t('dangerZone.dialog.consequences.tasks')}</li>
          <li>{t('dangerZone.dialog.consequences.recurrences')}</li>
          <li>{t('dangerZone.dialog.consequences.inbox')}</li>
          <li>{t('dangerZone.dialog.consequences.profile')}</li>
          <li>{t('dangerZone.dialog.consequences.activity')}</li>
        </ul>
        <div>
          <label
            htmlFor="delete-confirm-input"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {t('dangerZone.dialog.confirmPrompt')}
          </label>
          <input
            id="delete-confirm-input"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={t('dangerZone.dialog.confirmPlaceholder')}
            disabled={isPending}
            autoComplete="off"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-red-400 dark:focus:ring-red-400"
          />
        </div>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    </ConfirmDialog>
  );
}
