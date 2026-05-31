import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreateTask } from '../hooks/use-tasks';
import { useTaskUIStore } from '../store/task-ui.store';
import { useToastStore } from '@/shared/store/toast.store';
import { TaskForm } from '../components';
import type { CreateTaskInput } from '../types';
import { useActivityRecorder } from '../hooks/use-activity-recorder';
import { trackEvent } from '@/shared/analytics';
import { useScrollLock } from '@/shared/hooks/use-scroll-lock';

export function CreateTaskContainer() {
  const { t } = useTranslation('task');
  const isOpen = useTaskUIStore((s) => s.isCreateModalOpen);
  const closeCreateModal = useTaskUIStore((s) => s.closeCreateModal);
  const addToast = useToastStore((s) => s.addToast);
  const { mutate: createTask, isPending, isError, error } = useCreateTask();
  const recorder = useActivityRecorder();
  useScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key !== 'Escape') return;
      if (document.querySelector('.taskops-date-picker [role="dialog"]'))
        return;
      closeCreateModal();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeCreateModal]);

  if (!isOpen) return null;

  function handleSubmit(data: CreateTaskInput): void {
    createTask(data, {
      onSuccess: (createdTask) => {
        addToast(t('toast.created'), 'success');
        closeCreateModal();
        recorder.recordTaskCreated(createdTask.id);
        trackEvent('task_created');
      },
      onError: () => {
        addToast(t('toast.createFailed'), 'error');
      },
    });
  }

  const errorMessage = isError && error instanceof Error ? error.message : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-task-title"
        className="mx-4 flex w-full max-w-md flex-col rounded-lg bg-white shadow-xl md:mx-auto dark:bg-gray-800 max-h-[calc(100vh-2rem)]"
      >
        <div className="overflow-y-auto overscroll-contain p-4 md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2
              id="create-task-title"
              className="text-lg font-semibold text-gray-900 dark:text-gray-100"
            >
              {t('modal.createTitle')}
            </h2>
            <button
              type="button"
              aria-label={t('common:action.close')}
              onClick={closeCreateModal}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              ✕
            </button>
          </div>
          {errorMessage && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-900/20">
              <p className="text-sm text-red-700 dark:text-red-400">
                {errorMessage}
              </p>
            </div>
          )}
          <TaskForm
            onSubmit={handleSubmit}
            isSubmitting={isPending}
            submitLabel={t('modal.submitCreate')}
            autoFocusTitle
          />
        </div>
      </div>
    </div>
  );
}
