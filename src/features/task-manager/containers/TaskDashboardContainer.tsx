import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTasks } from '../hooks/use-tasks';
import { useAutoPurge } from '../hooks/use-auto-purge';
import { useCleanupDoneTasks } from '../hooks/use-cleanup-done-tasks';
import { useTaskUIStore } from '../store/task-ui.store';
import { useToastStore } from '@/shared/store/toast.store';
import {
  getTaskStats,
  getCleanupCandidates,
  filterVisibleTasks,
  applyAllFilters,
} from '../utils/task.utils';
import { TaskStats, ViewToggle, ConfirmDialog } from '../components';
import { TaskListContainer } from './TaskListContainer';
import { CreateTaskContainer } from './CreateTaskContainer';
import { EditTaskContainer } from './EditTaskContainer';

export function TaskDashboardContainer() {
  const { t } = useTranslation('task');
  const { data } = useTasks();
  const openCreateModal = useTaskUIStore((s) => s.openCreateModal);
  const viewMode = useTaskUIStore((s) => s.viewMode);
  const setViewMode = useTaskUIStore((s) => s.setViewMode);
  const showArchived = useTaskUIStore((s) => s.showArchived);
  const statusFilter = useTaskUIStore((s) => s.statusFilter);
  const priorityFilter = useTaskUIStore((s) => s.priorityFilter);
  const searchQuery = useTaskUIStore((s) => s.searchQuery);

  const { mutate: cleanupDone, isPending: isCleaning } = useCleanupDoneTasks();
  const addToast = useToastStore((s) => s.addToast);
  const [showCleanupConfirm, setShowCleanupConfirm] = useState(false);

  const allVisible = useMemo(
    () => filterVisibleTasks(data?.tasks ?? [], showArchived),
    [data, showArchived],
  );
  const stats = useMemo(() => getTaskStats(allVisible), [allVisible]);
  const totalTasks = useMemo(
    () =>
      applyAllFilters(data?.tasks ?? [], {
        showArchived,
        statusFilter,
        priorityFilter,
        searchQuery,
      }).length,
    [data, showArchived, statusFilter, priorityFilter, searchQuery],
  );
  const cleanupCount = useMemo(
    () => getCleanupCandidates(data?.tasks ?? []).length,
    [data],
  );

  useAutoPurge(data?.tasks ?? []);

  function handleCleanup(): void {
    const candidateIds = getCleanupCandidates(data?.tasks ?? []).map(
      (t) => t.id,
    );
    cleanupDone(candidateIds, {
      onSuccess: ({ archivedCount }) => {
        addToast(
          t('dashboard.cleanupSuccess', { count: archivedCount }),
          'success',
        );
        setShowCleanupConfirm(false);
      },
      onError: () => {
        addToast(t('dashboard.cleanupFailed'), 'error');
        setShowCleanupConfirm(false);
      },
    });
  }

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t('dashboard.title')}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {totalTasks === 0
              ? t('empty.noTasks')
              : t('dashboard.tasksShown', { count: totalTasks })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          {cleanupCount > 0 && (
            <button
              type="button"
              onClick={() => setShowCleanupConfirm(true)}
              className="cursor-pointer whitespace-nowrap rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              {t('dashboard.cleanupDone', { count: cleanupCount })}
            </button>
          )}
          <button
            type="button"
            onClick={openCreateModal}
            className="cursor-pointer flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <span aria-hidden="true">+</span>
            {t('common:action.newTask')}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <TaskStats stats={stats} />
        <TaskListContainer />
      </div>

      <CreateTaskContainer />
      <EditTaskContainer />

      <ConfirmDialog
        isOpen={showCleanupConfirm}
        title={t('dashboard.cleanupTitle')}
        description={t('dashboard.cleanupDescription', { count: cleanupCount })}
        confirmLabel={t('common:action.archive')}
        variant="default"
        isLoading={isCleaning}
        onConfirm={handleCleanup}
        onCancel={() => setShowCleanupConfirm(false)}
      />
    </>
  );
}
