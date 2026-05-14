import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  useTasks,
  useDeleteTask,
  useCreateTask,
  useReorderTasks,
} from '../hooks/use-tasks';
import { useChecklistSummaries } from '../hooks/use-checklist';
import { useArchiveTask, useUnarchiveTask } from '../hooks/use-archive-task';
import { useTaskUIStore } from '../store/task-ui.store';
import {
  applyAllFilters,
  sortTasks,
  groupTasksByPosition,
  extractReorderUpdates,
  buildDuplicateInput,
} from '../utils/task.utils';
import type { TaskListResponse } from '../api';
import type { TaskBoard } from '../utils/task.utils';
import { taskKeys } from '../hooks/task.keys';
import { RouteSpinner } from '@/shared/components/RouteSpinner';
import { TaskFilters } from '../components/TaskFilters';
import { TaskList } from '../components/TaskList';
import { ConfirmDialog } from '../components/ConfirmDialog';
import {
  celebrateTaskDone,
  getConfettiOriginFromElement,
} from '../utils/confetti';

const BoardView = lazy(() =>
  import('../components/BoardView').then((m) => ({ default: m.BoardView })),
);

const HIGHLIGHT_MS = 3000;
const HIGHLIGHT_CLASS =
  'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-gray-900';

export function TaskListContainer() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error, refetch } = useTasks();
  const { data: checklistSummaries } = useChecklistSummaries();
  const {
    mutate: deleteTask,
    isPending: isDeleting,
    variables: deletingId,
  } = useDeleteTask();
  const { mutate: archiveTask } = useArchiveTask();
  const { mutate: unarchiveTask } = useUnarchiveTask();
  const { mutate: reorderMutation } = useReorderTasks();
  const { mutate: createTask } = useCreateTask();

  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const statusFilter = useTaskUIStore((s) => s.statusFilter);
  const priorityFilter = useTaskUIStore((s) => s.priorityFilter);
  const searchQuery = useTaskUIStore((s) => s.searchQuery);
  const showArchived = useTaskUIStore((s) => s.showArchived);
  const viewMode = useTaskUIStore((s) => s.viewMode);
  const setStatusFilter = useTaskUIStore((s) => s.setStatusFilter);
  const setPriorityFilter = useTaskUIStore((s) => s.setPriorityFilter);
  const setSearchQuery = useTaskUIStore((s) => s.setSearchQuery);
  const resetFilters = useTaskUIStore((s) => s.resetFilters);
  const toggleShowArchived = useTaskUIStore((s) => s.toggleShowArchived);
  const openCreateModal = useTaskUIStore((s) => s.openCreateModal);

  // Scroll to and highlight a task when navigated from a reminder
  const highlightTaskId = (location.state as { highlightTaskId?: string })
    ?.highlightTaskId;

  useEffect(() => {
    if (!highlightTaskId) return;

    // Clear router state so refresh/back doesn't re-trigger
    navigate(location.pathname, { replace: true, state: {} });

    // Wait for DOM to settle after navigation
    const raf = requestAnimationFrame(() => {
      const el = document.querySelector(
        `[data-task-id="${CSS.escape(highlightTaskId)}"]`,
      );
      if (!el) return;

      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      for (const cls of HIGHLIGHT_CLASS.split(' ')) {
        el.classList.add(cls);
      }
      setTimeout(() => {
        for (const cls of HIGHLIGHT_CLASS.split(' ')) {
          el.classList.remove(cls);
        }
      }, HIGHLIGHT_MS);
    });

    return () => cancelAnimationFrame(raf);
  }, [highlightTaskId, navigate, location.pathname]);

  const filteredTasks = useMemo(
    () =>
      sortTasks(
        applyAllFilters(data?.tasks ?? [], {
          showArchived,
          statusFilter,
          priorityFilter,
          searchQuery,
        }),
      ),
    [data, statusFilter, priorityFilter, searchQuery, showArchived],
  );

  function handleDelete(id: string): void {
    setTaskToDelete(id);
  }

  function handleConfirmDelete(): void {
    if (!taskToDelete) return;
    deleteTask(taskToDelete, {
      onSuccess: () => {
        setTaskToDelete(null);
      },
    });
  }

  function handleCancelDelete(): void {
    setTaskToDelete(null);
  }

  function handleArchive(id: string): void {
    const task = data?.tasks.find((t) => t.id === id);
    if (task?.isArchived) {
      unarchiveTask(id);
    } else {
      archiveTask(id);
    }
  }

  function handleDuplicate(id: string): void {
    const task = data?.tasks.find((t) => t.id === id);
    if (!task) return;
    createTask(buildDuplicateInput(task));
  }

  function handleBoardChange(newBoard: TaskBoard): void {
    const currentData = queryClient.getQueryData<TaskListResponse>(
      taskKeys.lists(),
    );
    if (!currentData) return;

    const updates = extractReorderUpdates(newBoard, currentData.tasks);
    if (updates.length === 0) return;

    const previousData = currentData;

    // Optimistic update: apply positions + status changes to cache
    const updateMap = new Map(updates.map((u) => [u.id, u]));
    const optimisticTasks = currentData.tasks.map((t) => {
      const update = updateMap.get(t.id);
      if (!update) return t;
      return {
        ...t,
        position: update.position,
        ...(update.status !== undefined ? { status: update.status } : {}),
      };
    });

    queryClient.setQueryData<TaskListResponse>(taskKeys.lists(), {
      ...currentData,
      tasks: optimisticTasks,
    });

    // Detect first task transitioning to done (compare against pre-optimistic snapshot)
    const previousTaskMap = new Map(previousData.tasks.map((t) => [t.id, t]));
    const firstNewDone = updates.find(
      (u) =>
        u.status === 'done' && previousTaskMap.get(u.id)?.status !== 'done',
    );

    reorderMutation(updates, {
      onSuccess: () => {
        if (firstNewDone) {
          const el = document.querySelector(
            `[data-task-id="${CSS.escape(firstNewDone.id)}"]`,
          );
          celebrateTaskDone(getConfettiOriginFromElement(el));
        }
      },
      onError: () => {
        queryClient.setQueryData(taskKeys.lists(), previousData);
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      },
    });
  }

  if (isError) {
    const message =
      error instanceof Error ? error.message : 'Something went wrong.';
    return (
      <div className="flex flex-col gap-4">
        <TaskFilters
          statusFilter={statusFilter}
          priorityFilter={priorityFilter}
          searchQuery={searchQuery}
          showArchived={showArchived}
          onStatusChange={setStatusFilter}
          onPriorityChange={setPriorityFilter}
          onSearchChange={setSearchQuery}
          onReset={resetFilters}
          onToggleArchived={toggleShowArchived}
        />
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">
            {message}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-2 rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200 dark:bg-red-800 dark:text-red-300 dark:hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const board = groupTasksByPosition(filteredTasks);

  return (
    <>
      <div className="flex flex-col gap-4">
        <TaskFilters
          statusFilter={statusFilter}
          priorityFilter={priorityFilter}
          searchQuery={searchQuery}
          showArchived={showArchived}
          onStatusChange={setStatusFilter}
          onPriorityChange={setPriorityFilter}
          onSearchChange={setSearchQuery}
          onReset={resetFilters}
          onToggleArchived={toggleShowArchived}
        />
        {viewMode === 'board' ? (
          <Suspense fallback={<RouteSpinner />}>
            <BoardView
              board={board}
              onDelete={handleDelete}
              onClick={(id) => navigate(`/app/tasks/${id}`)}
              onArchive={handleArchive}
              onDuplicate={handleDuplicate}
              deletingId={isDeleting ? (deletingId ?? null) : null}
              onBoardChange={handleBoardChange}
              checklistSummaries={checklistSummaries}
            />
          </Suspense>
        ) : (
          <TaskList
            compact
            tasks={filteredTasks}
            isLoading={isLoading}
            deletingId={isDeleting ? (deletingId ?? null) : null}
            onDelete={handleDelete}
            onClick={(id) => navigate(`/app/tasks/${id}`)}
            onCreateNew={openCreateModal}
            onArchive={handleArchive}
            onDuplicate={handleDuplicate}
            checklistSummaries={checklistSummaries}
          />
        )}
      </div>
      <ConfirmDialog
        isOpen={!!taskToDelete}
        title="Delete task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
}
