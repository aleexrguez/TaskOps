import type {
  CreateTaskInput,
  Task,
  TaskStatus,
  ChecklistItem,
  ReorderChecklistItem,
} from '../types';
import { formatDate, formatDateTime } from '../utils/date.utils';
import { Checklist } from './Checklist';
import { DueDateDisplay } from './DueDateDisplay';
import { PriorityIndicator } from './PriorityIndicator';
import { StatusBadge } from './StatusBadge';
import { StatusSelector } from './StatusSelector';
import { TaskForm } from './TaskForm';
import { ActivityTimeline } from './ActivityTimeline';
import type { ActivityEvent } from '../types/activity.types';

interface TaskDetailViewProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  isEditing?: boolean;
  onSave?: (data: CreateTaskInput) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  isRecurring?: boolean;
  frequencyLabel?: string;
  checklistItems?: ChecklistItem[];
  checklistLoading?: boolean;
  onChecklistToggle?: (id: string, isCompleted: boolean) => void;
  onChecklistCreate?: (title: string) => void;
  onChecklistDelete?: (id: string) => void;
  onChecklistUpdate?: (id: string, title: string) => void;
  onChecklistReorder?: (items: ReorderChecklistItem[]) => void;
  onDuplicate?: () => void;
  onArchive?: () => void;
  isArchived?: boolean;
  onStatusChange?: (status: TaskStatus) => void;
  isStatusUpdating?: boolean;
  activityEvents?: ActivityEvent[];
  activityLoading?: boolean;
}

export function TaskDetailView({
  task,
  onEdit,
  onDelete,
  isEditing = false,
  onSave,
  onCancel,
  isSubmitting = false,
  isRecurring = false,
  frequencyLabel,
  checklistItems,
  checklistLoading,
  onChecklistToggle,
  onChecklistCreate,
  onChecklistDelete,
  onChecklistUpdate,
  onChecklistReorder,
  onDuplicate,
  onArchive,
  isArchived = false,
  onStatusChange,
  isStatusUpdating = false,
  activityEvents,
  activityLoading,
}: TaskDetailViewProps) {
  const createdDate = formatDate(task.createdAt);
  const updatedDate = formatDate(task.updatedAt);

  const initialValues: Partial<CreateTaskInput> = {
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate,
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {isEditing ? (
        <div className="space-y-4">
          <TaskForm
            initialValues={initialValues}
            onSubmit={onSave ?? (() => {})}
            isSubmitting={isSubmitting}
            submitLabel="Save Changes"
          />
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {task.title}
            </h1>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={onEdit}
                className="cursor-pointer rounded-md min-h-[44px] px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              >
                Edit
              </button>
              {onDuplicate && (
                <button
                  onClick={onDuplicate}
                  className="cursor-pointer rounded-md min-h-[44px] px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                >
                  Duplicate
                </button>
              )}
              {onArchive && (
                <button
                  onClick={onArchive}
                  className="cursor-pointer rounded-md min-h-[44px] px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                >
                  {isArchived ? 'Unarchive' : 'Archive'}
                </button>
              )}
              <button
                onClick={onDelete}
                className="cursor-pointer rounded-md min-h-[44px] px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/40 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              >
                Delete
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            {task.description ?? 'No description'}
          </p>

          {onChecklistCreate && (
            <Checklist
              items={checklistItems ?? []}
              onToggle={onChecklistToggle!}
              onCreate={onChecklistCreate}
              onDelete={onChecklistDelete!}
              onUpdate={onChecklistUpdate!}
              onReorder={onChecklistReorder!}
              isLoading={checklistLoading}
            />
          )}

          <div className="flex flex-wrap items-center gap-3">
            {onStatusChange ? (
              <StatusSelector
                status={task.status}
                onStatusChange={onStatusChange}
                disabled={isStatusUpdating}
              />
            ) : (
              <StatusBadge status={task.status} />
            )}
            <PriorityIndicator priority={task.priority} />
            {isRecurring && (
              <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                Recurring
              </span>
            )}
            {isRecurring && frequencyLabel && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {frequencyLabel}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 text-sm dark:border-gray-700">
            <div>
              <span className="font-medium text-gray-500 dark:text-gray-400">
                Created
              </span>
              <p className="mt-1 text-gray-900 dark:text-gray-100">
                {createdDate}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-500 dark:text-gray-400">
                Updated
              </span>
              <p className="mt-1 text-gray-900 dark:text-gray-100">
                {updatedDate}
              </p>
            </div>
            {task.dueDate && (
              <div>
                <span className="font-medium text-gray-500 dark:text-gray-400">
                  Due Date
                </span>
                <p className="mt-1 text-gray-900 dark:text-gray-100">
                  <DueDateDisplay dueDate={task.dueDate} status={task.status} />
                </p>
              </div>
            )}
            {task.status === 'done' && task.completedAt && (
              <div>
                <span className="font-medium text-gray-500 dark:text-gray-400">
                  Completed
                </span>
                <p className="mt-1 text-gray-900 dark:text-gray-100">
                  {formatDateTime(task.completedAt)}
                </p>
              </div>
            )}
          </div>

          {activityEvents !== undefined && (
            <ActivityTimeline
              events={activityEvents}
              isLoading={activityLoading}
            />
          )}
        </div>
      )}
    </div>
  );
}
