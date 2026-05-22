import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecurrences, useDeleteRecurrence } from '../hooks/use-recurrences';
import { useRecurrenceUIStore } from '../store/recurrence-ui.store';
import { useToastStore } from '@/shared/store/toast.store';
import { RecurrenceGroupedLayout } from '../components/RecurrenceGroupedLayout';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { CreateRecurrenceContainer } from './CreateRecurrenceContainer';
import { EditRecurrenceContainer } from './EditRecurrenceContainer';
import { groupByFrequency } from '../utils/recurrence.utils';

export function RecurrenceDashboardContainer() {
  const { t } = useTranslation('recurrence');
  const { data, isLoading, isError, error, refetch } = useRecurrences();
  const { mutate: deleteRecurrence, isPending: isDeleting } =
    useDeleteRecurrence();
  const openCreateModal = useRecurrenceUIStore((s) => s.openCreateModal);
  const openEditModal = useRecurrenceUIStore((s) => s.openEditModal);
  const addToast = useToastStore((s) => s.addToast);

  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

  function handleDeleteRequest(id: string): void {
    setTemplateToDelete(id);
  }

  function handleConfirmDelete(): void {
    if (!templateToDelete) return;
    deleteRecurrence(templateToDelete, {
      onSuccess: () => {
        addToast(t('toast.deleted'), 'success');
        setTemplateToDelete(null);
      },
      onError: () => {
        addToast(t('toast.deleteFailed'), 'error');
        setTemplateToDelete(null);
      },
    });
  }

  function handleCancelDelete(): void {
    setTemplateToDelete(null);
  }

  if (isLoading) {
    return (
      <div
        className="flex justify-center py-12"
        role="status"
        aria-label={t('common:action.loading')}
      >
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (isError) {
    const message =
      error instanceof Error ? error.message : t('common:error.generic');
    return (
      <div>
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t('heading')}
          </h1>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">
            {message}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-2 rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200 dark:bg-red-800 dark:text-red-300 dark:hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            {t('dashboard.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  const templates = data?.recurrences ?? [];
  const groups = groupByFrequency(templates);

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {t('heading')}
        </h1>
        <button
          type="button"
          onClick={openCreateModal}
          className="cursor-pointer flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <span aria-hidden="true">+</span>
          {t('dashboard.newRecurrence')}
        </button>
      </div>

      <RecurrenceGroupedLayout
        groups={groups}
        onEdit={openEditModal}
        onDelete={handleDeleteRequest}
        onCreateNew={openCreateModal}
      />

      <ConfirmDialog
        isOpen={!!templateToDelete}
        title={t('confirm.deleteTitle')}
        description={t('confirm.deleteDescription')}
        confirmLabel={t('common:action.delete')}
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      <CreateRecurrenceContainer />
      <EditRecurrenceContainer />
    </>
  );
}
