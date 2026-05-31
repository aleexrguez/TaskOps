import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTask, useUpdateTask } from '../hooks/use-tasks';
import { useTaskUIStore } from '../store/task-ui.store';
import { useToastStore } from '@/shared/store/toast.store';
import { TaskForm } from '../components';
import type { CreateTaskWithChecklistInput } from '../types';
import {
  celebrateTaskDone,
  getConfettiOriginFromElement,
} from '../utils/confetti';
import { trackEvent } from '@/shared/analytics';
import { useScrollLock } from '@/shared/hooks/use-scroll-lock';

export function EditTaskContainer() {
  const { t } = useTranslation('task');
  const isOpen = useTaskUIStore((s) => s.isEditModalOpen);
  const selectedTaskId = useTaskUIStore((s) => s.selectedTaskId);
  const closeEditModal = useTaskUIStore((s) => s.closeEditModal);
  const addToast = useToastStore((s) => s.addToast);
  const { mutate: updateTask, isPending, isError, error } = useUpdateTask();

  const { data: task, isLoading } = useTask(selectedTaskId ?? '');
  useScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key !== 'Escape') return;
      if (document.querySelector('.taskops-date-picker [role="dialog"]'))
        return;
      closeEditModal();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeEditModal]);

  if (!isOpen || !selectedTaskId) return null;

  function handleSubmit(data: CreateTaskWithChecklistInput): void {
    if (!selectedTaskId) return;
    const previousStatus = task?.status;
    updateTask(
      { id: selectedTaskId, input: data.taskInput },
      {
        onSuccess: () => {
          addToast(t('toast.updated'), 'success');
          closeEditModal();
          if (
            data.taskInput.status === 'done' &&
            previousStatus !== undefined &&
            previousStatus !== 'done'
          ) {
            const el = document.querySelector(
              `[data-task-id="${CSS.escape(selectedTaskId!)}"]`,
            );
            celebrateTaskDone(getConfettiOriginFromElement(el));
            trackEvent('task_completed');
          }
        },
        onError: () => {
          addToast(t('toast.updateFailed'), 'error');
        },
      },
    );
  }

  const errorMessage = isError && error instanceof Error ? error.message : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-task-title"
        className="mx-4 flex w-full max-w-md flex-col rounded-lg bg-white shadow-xl md:mx-auto dark:bg-gray-800 max-h-[calc(100vh-2rem)]"
      >
        <div className="overflow-y-auto overscroll-contain p-4 md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2
              id="edit-task-title"
              className="text-lg font-semibold text-gray-900 dark:text-gray-100"
            >
              {t('modal.editTitle')}
            </h2>
            <button
              type="button"
              aria-label={t('common:action.close')}
              onClick={closeEditModal}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              ✕
            </button>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
            </div>
          ) : (
            <>
              {errorMessage && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-900/20">
                  <p className="text-sm text-red-700 dark:text-red-400">
                    {errorMessage}
                  </p>
                </div>
              )}
              <TaskForm
                onSubmit={handleSubmit}
                initialValues={task}
                isSubmitting={isPending}
                submitLabel={t('modal.submitSave')}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
