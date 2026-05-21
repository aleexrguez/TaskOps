import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreateRecurrence } from '../hooks/use-recurrences';
import { useRecurrenceUIStore } from '../store/recurrence-ui.store';
import { useToastStore } from '@/shared/store/toast.store';
import { RecurrenceForm } from '../components/RecurrenceForm';
import type { CreateRecurrenceInput } from '../types/recurrence.types';

export function CreateRecurrenceContainer() {
  const { t } = useTranslation('recurrence');
  const isOpen = useRecurrenceUIStore((s) => s.isCreateModalOpen);
  const closeCreateModal = useRecurrenceUIStore((s) => s.closeCreateModal);
  const addToast = useToastStore((s) => s.addToast);
  const { mutateAsync: createRecurrence, isPending } = useCreateRecurrence();

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') closeCreateModal();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeCreateModal]);

  if (!isOpen) return null;

  async function handleSubmit(data: CreateRecurrenceInput): Promise<void> {
    try {
      await createRecurrence(data);
      addToast(t('toast.created'), 'success');
      closeCreateModal();
    } catch {
      addToast(t('toast.createFailed'), 'error');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-recurrence-title"
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2
            id="create-recurrence-title"
            className="text-lg font-semibold text-gray-900 dark:text-gray-100"
          >
            {t('modal.createTitle')}
          </h2>
          <button
            type="button"
            aria-label={t('common:action.close')}
            onClick={closeCreateModal}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            ✕
          </button>
        </div>
        <RecurrenceForm
          onSubmit={handleSubmit}
          isSubmitting={isPending}
          submitLabel={t('modal.submitCreate')}
          autoFocusTitle
        />
      </div>
    </div>
  );
}
