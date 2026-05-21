import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useTask,
  useDeleteTask,
  useUpdateTask,
  useCreateTask,
} from '../hooks/use-tasks';
import { buildDuplicateInput } from '../utils/task.utils';
import { useArchiveTask, useUnarchiveTask } from '../hooks/use-archive-task';
import type { TaskStatus } from '../types';
import {
  useChecklist,
  useCreateChecklistItem,
  useUpdateChecklistItem,
  useDeleteChecklistItem,
  useReorderChecklistItems,
} from '../hooks/use-checklist';
import { useToastStore } from '@/shared/store/toast.store';
import { TaskDetailView } from '../components/TaskDetailView';
import { useActivityEvents } from '../hooks/use-activity';
import { useActivityRecorder } from '../hooks/use-activity-recorder';
import { TaskNotFound } from '../components/TaskNotFound';
import { TaskErrorState } from '../components/TaskErrorState';
import { ConfirmDialog } from '../components/ConfirmDialog';
import {
  isGeneratedTask,
  formatFrequencyLabel,
} from '@/features/recurrences/utils/recurrence.utils';
import { useRecurrence } from '@/features/recurrences/hooks/use-recurrences';
import type { CreateTaskInput } from '../types';
import { celebrateTaskDone } from '../utils/confetti';

export function TaskDetailContainer() {
  const { t } = useTranslation('task');
  const { t: tRecurrence } = useTranslation('recurrence');
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: task, isLoading, isError, error, refetch } = useTask(id);

  const addToast = useToastStore((s) => s.addToast);

  const { mutate: deleteTask, isPending: isDeleting } = useDeleteTask();
  const { mutate: updateTask, isPending: isUpdating } = useUpdateTask();
  const { mutate: createTask } = useCreateTask();
  const { mutate: archiveTask } = useArchiveTask();
  const { mutate: unarchiveTask } = useUnarchiveTask();

  const [showConfirm, setShowConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const recurring = task ? isGeneratedTask(task) : false;
  const { data: recurrenceTemplate } = useRecurrence(
    task?.recurrenceTemplateId ?? '',
  );
  const frequencyLabel = recurrenceTemplate
    ? formatFrequencyLabel(recurrenceTemplate, tRecurrence)
    : undefined;

  // Checklist hooks
  const { data: checklistItems, isLoading: checklistLoading } =
    useChecklist(id);
  const { mutate: createChecklistItemMut } = useCreateChecklistItem(id);
  const { mutate: updateChecklistItemMut } = useUpdateChecklistItem(id);
  const { mutate: deleteChecklistItemMut } = useDeleteChecklistItem(id);
  const { mutate: reorderChecklistItemsMut } = useReorderChecklistItems(id);

  // Activity hooks
  const { data: activityEvents, isLoading: activityLoading } =
    useActivityEvents(id);
  const recorder = useActivityRecorder();

  function handleChecklistToggle(itemId: string, isCompleted: boolean): void {
    const item = checklistItems?.find((i) => i.id === itemId);
    updateChecklistItemMut(
      { id: itemId, input: { isCompleted } },
      {
        onSuccess: () => {
          if (isCompleted && item) {
            recorder.recordChecklistItemCompleted(id, item.title);
          }
        },
      },
    );
  }

  function handleChecklistCreate(title: string): void {
    createChecklistItemMut(
      { title },
      {
        onSuccess: () => recorder.recordChecklistItemCreated(id, title),
      },
    );
  }

  function handleChecklistDelete(itemId: string): void {
    const item = checklistItems?.find((i) => i.id === itemId);
    deleteChecklistItemMut(itemId, {
      onSuccess: () => {
        if (item) recorder.recordChecklistItemDeleted(id, item.title);
      },
    });
  }

  function handleChecklistUpdate(itemId: string, title: string): void {
    updateChecklistItemMut({ id: itemId, input: { title } });
  }

  function handleChecklistReorder(
    items: { id: string; position: number }[],
  ): void {
    reorderChecklistItemsMut(items);
  }

  function handleBack(): void {
    navigate('/app/tasks');
  }

  function handleEdit(): void {
    setIsEditing(true);
  }

  function handleSave(data: CreateTaskInput): void {
    if (!task) return;
    const previousStatus = task.status;
    updateTask(
      { id: task.id, input: data },
      {
        onSuccess: () => {
          addToast(t('toast.updated'), 'success');
          setIsEditing(false);
          recorder.recordTaskUpdate(task.id, task, data);
          if (data.status === 'done' && previousStatus !== 'done') {
            celebrateTaskDone();
          }
        },
        onError: () => {
          addToast(t('toast.updateFailed'), 'error');
        },
      },
    );
  }

  function handleCancel(): void {
    setIsEditing(false);
  }

  function handleDeleteRequest(): void {
    setShowConfirm(true);
  }

  function handleConfirmDelete(): void {
    if (!task) return;
    deleteTask(task.id, {
      onSuccess: () => {
        addToast(t('toast.deleted'), 'success');
        navigate('/app');
      },
      onError: () => {
        addToast(t('toast.deleteFailed'), 'error');
        setShowConfirm(false);
      },
    });
  }

  function handleCancelDelete(): void {
    setShowConfirm(false);
  }

  function handleDuplicate(): void {
    if (!task) return;
    createTask(buildDuplicateInput(task), {
      onSuccess: (createdTask) => {
        addToast(t('toast.duplicated'), 'success');
        recorder.recordTaskCreated(createdTask.id);
      },
      onError: () => addToast(t('toast.duplicateFailed'), 'error'),
    });
  }

  function handleArchive(): void {
    if (!task) return;
    if (task.isArchived) {
      unarchiveTask(task.id, {
        onSuccess: () => {
          addToast(t('toast.unarchived'), 'success');
          recorder.recordUnarchive(task.id);
        },
        onError: () => addToast(t('toast.unarchiveFailed'), 'error'),
      });
    } else {
      archiveTask(task.id, {
        onSuccess: () => {
          addToast(t('toast.archived'), 'success');
          recorder.recordArchive(task.id);
        },
        onError: () => addToast(t('toast.archiveFailed'), 'error'),
      });
    }
  }

  function handleStatusChange(newStatus: TaskStatus): void {
    if (!task || task.status === newStatus) return;
    const previousStatus = task.status;
    updateTask(
      { id: task.id, input: { status: newStatus } },
      {
        onSuccess: () => {
          addToast(t('toast.statusUpdated'), 'success');
          recorder.recordTaskUpdate(task.id, task, { status: newStatus });
          if (newStatus === 'done' && previousStatus !== 'done') {
            celebrateTaskDone();
          }
        },
        onError: () => addToast(t('toast.statusUpdateFailed'), 'error'),
      },
    );
  }

  function renderContent() {
    if (isLoading) {
      return (
        <div
          role="status"
          aria-label={t('a11y.loadingTaskDetails')}
          aria-live="polite"
          className="mx-auto max-w-2xl space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="h-8 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="flex gap-2">
            <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="h-6 w-16 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      );
    }

    if (isError) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong.';

      if (message.startsWith('Task not found')) {
        return <TaskNotFound onBack={handleBack} />;
      }

      return <TaskErrorState message={message} onRetry={() => refetch()} />;
    }

    if (task) {
      return (
        <TaskDetailView
          task={task}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
          isEditing={isEditing}
          onSave={handleSave}
          onCancel={handleCancel}
          isSubmitting={isUpdating}
          isRecurring={recurring}
          frequencyLabel={frequencyLabel}
          checklistItems={checklistItems}
          checklistLoading={checklistLoading}
          onChecklistToggle={handleChecklistToggle}
          onChecklistCreate={handleChecklistCreate}
          onChecklistDelete={handleChecklistDelete}
          onChecklistUpdate={handleChecklistUpdate}
          onChecklistReorder={handleChecklistReorder}
          onDuplicate={handleDuplicate}
          onArchive={task.status === 'done' ? handleArchive : undefined}
          isArchived={task.isArchived}
          onStatusChange={handleStatusChange}
          isStatusUpdating={isUpdating}
          activityEvents={activityEvents}
          activityLoading={activityLoading}
        />
      );
    }

    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8" hidden={showConfirm}>
        <button
          onClick={handleBack}
          className="mb-4 inline-flex items-center text-sm font-medium text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          &larr; {t('confirm.backToTasks')}
        </button>
        {renderContent()}
      </div>
      <ConfirmDialog
        isOpen={showConfirm}
        title={t('confirm.deleteTitle')}
        description={t('confirm.deleteDescription')}
        confirmLabel={t('common:action.delete')}
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}
