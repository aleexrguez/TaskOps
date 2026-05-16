import { useEffect } from 'react';
import { useTask, useUpdateTask } from '../hooks/use-tasks';
import { useTaskUIStore } from '../store/task-ui.store';
import { useToastStore } from '@/shared/store/toast.store';
import { TaskForm } from '../components';
import type { CreateTaskInput } from '../types';
import {
  celebrateTaskDone,
  getConfettiOriginFromElement,
} from '../utils/confetti';

export function EditTaskContainer() {
  const isOpen = useTaskUIStore((s) => s.isEditModalOpen);
  const selectedTaskId = useTaskUIStore((s) => s.selectedTaskId);
  const closeEditModal = useTaskUIStore((s) => s.closeEditModal);
  const addToast = useToastStore((s) => s.addToast);
  const { mutate: updateTask, isPending, isError, error } = useUpdateTask();

  const { data: task, isLoading } = useTask(selectedTaskId ?? '');

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

  function handleSubmit(data: CreateTaskInput): void {
    if (!selectedTaskId) return;
    const previousStatus = task?.status;
    updateTask(
      { id: selectedTaskId, input: data },
      {
        onSuccess: () => {
          addToast('Task updated', 'success');
          closeEditModal();
          if (
            data.status === 'done' &&
            previousStatus !== undefined &&
            previousStatus !== 'done'
          ) {
            const el = document.querySelector(
              `[data-task-id="${CSS.escape(selectedTaskId!)}"]`,
            );
            celebrateTaskDone(getConfettiOriginFromElement(el));
          }
        },
        onError: () => {
          addToast('Failed to update task', 'error');
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
        className="mx-4 w-full max-w-md rounded-lg bg-white p-4 shadow-xl md:mx-auto md:p-6 dark:bg-gray-800"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2
            id="edit-task-title"
            className="text-lg font-semibold text-gray-900 dark:text-gray-100"
          >
            Edit Task
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={closeEditModal}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
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
              submitLabel="Save Changes"
            />
          </>
        )}
      </div>
    </div>
  );
}
