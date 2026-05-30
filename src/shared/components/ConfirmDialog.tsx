import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useFocusTrap } from '../hooks/use-focus-trap';
import { useScrollLock } from '../hooks/use-scroll-lock';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  variant?: 'danger' | 'default';
  confirmDisabled?: boolean;
  children?: React.ReactNode;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
  isLoading = false,
  variant = 'default',
  confirmDisabled = false,
  children,
}: ConfirmDialogProps) {
  const { t } = useTranslation('common');
  useScrollLock(isOpen);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  const dialogRef = useFocusTrap({
    isOpen,
    onClose: isLoading ? undefined : onCancel,
    initialFocusRef: cancelButtonRef,
  });

  if (!isOpen) return null;

  const confirmButtonClass =
    variant === 'danger'
      ? 'min-h-[44px] cursor-pointer rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800'
      : 'min-h-[44px] cursor-pointer rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby={children ? undefined : 'confirm-dialog-description'}
        className="mx-4 w-full max-w-md rounded-lg bg-white p-4 shadow-xl md:mx-auto md:p-6 dark:bg-gray-800"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2
            id="confirm-dialog-title"
            className="text-lg font-semibold text-gray-900 dark:text-gray-100"
          >
            {title}
          </h2>
          <button
            type="button"
            aria-label={t('action.close')}
            onClick={onCancel}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center cursor-pointer text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            ✕
          </button>
        </div>
        {children ? (
          <div className="mb-6">{children}</div>
        ) : (
          <p
            id="confirm-dialog-description"
            className="mb-6 text-sm text-gray-600 dark:text-gray-300"
          >
            {description}
          </p>
        )}
        <div className="flex justify-end gap-3">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="min-h-[44px] cursor-pointer rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            {t('action.cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading || confirmDisabled}
            className={confirmButtonClass}
          >
            {isLoading ? `${confirmLabel}...` : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
