import { useTranslation } from 'react-i18next';
import { useFocusTrap } from '../hooks/use-focus-trap';
import { Footer } from './Footer';

interface AuthModalProps {
  children: React.ReactNode;
  title: string;
  onClose: () => void;
}

export function AuthModal({ children, title, onClose }: AuthModalProps) {
  const { t } = useTranslation('auth');

  const dialogRef = useFocusTrap({
    isOpen: true,
    onClose,
  });

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>): void {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="auth-modal-enter mx-4 w-full max-w-sm rounded-lg bg-white p-8 shadow-xl dark:bg-gray-800"
      >
        <div className="flex justify-end">
          <button
            type="button"
            aria-label={t('modal.close')}
            onClick={onClose}
            className="flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-full text-gray-400 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:ring-offset-2 dark:text-gray-500 dark:hover:text-gray-300 dark:focus-visible:ring-offset-gray-800"
          >
            ✕
          </button>
        </div>

        <span id="auth-modal-title" className="sr-only">
          {title}
        </span>

        {children}

        <Footer className="mt-6 border-t-0 py-2 text-xs" />
      </div>
    </div>
  );
}
