import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecurrence, useUpdateRecurrence } from '../hooks/use-recurrences';
import { useRecurrenceUIStore } from '../store/recurrence-ui.store';
import { useToastStore } from '@/shared/store/toast.store';
import { RecurrenceForm } from '../components/RecurrenceForm';
import type {
  CreateRecurrenceInput,
  UpdateRecurrenceInput,
} from '../types/recurrence.types';

export function EditRecurrenceContainer() {
  const { t } = useTranslation('recurrence');
  const isOpen = useRecurrenceUIStore((s) => s.isEditModalOpen);
  const selectedTemplateId = useRecurrenceUIStore((s) => s.selectedTemplateId);
  const closeEditModal = useRecurrenceUIStore((s) => s.closeEditModal);
  const addToast = useToastStore((s) => s.addToast);
  const { mutateAsync: updateRecurrence, isPending } = useUpdateRecurrence();

  const { data: template, isLoading } = useRecurrence(selectedTemplateId ?? '');

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') closeEditModal();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeEditModal]);

  if (!isOpen || !selectedTemplateId) return null;

  async function handleSubmit(data: CreateRecurrenceInput): Promise<void> {
    if (!selectedTemplateId) return;
    try {
      const updateInput: UpdateRecurrenceInput = {
        title: data.title,
        description: data.description,
        priority: data.priority,
        frequency: data.frequency,
        interval: data.interval,
        startDate: data.startDate,
        weeklyDays:
          data.frequency === 'weekly' && 'weeklyDays' in data
            ? data.weeklyDays
            : undefined,
        monthlyDay:
          data.frequency === 'monthly' && 'monthlyDay' in data
            ? data.monthlyDay
            : undefined,
        leadTimeDays:
          (data.frequency === 'monthly' || data.frequency === 'weekly') &&
          'leadTimeDays' in data
            ? data.leadTimeDays
            : undefined,
      };
      await updateRecurrence({ id: selectedTemplateId, input: updateInput });
      addToast(t('toast.updated'), 'success');
      closeEditModal();
    } catch {
      addToast(t('toast.updateFailed'), 'error');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-recurrence-title"
        className="flex w-full max-w-2xl flex-col rounded-lg bg-white shadow-xl dark:bg-gray-800 max-h-[calc(100vh-2rem)]"
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h2
            id="edit-recurrence-title"
            className="text-lg font-semibold text-gray-900 dark:text-gray-100"
          >
            {t('modal.editTitle')}
          </h2>
          <button
            type="button"
            aria-label={t('common:action.close')}
            onClick={closeEditModal}
            className="cursor-pointer text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
            </div>
          ) : (
            <RecurrenceForm
              onSubmit={handleSubmit}
              initialValues={template}
              isSubmitting={isPending}
              submitLabel={t('modal.submitSave')}
            />
          )}
        </div>
      </div>
    </div>
  );
}
