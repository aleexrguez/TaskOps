import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useTasks } from '../hooks/use-tasks';
import { useAutoPurge } from '../hooks/use-auto-purge';
import { useTaskUIStore } from '../store/task-ui.store';
import { useAppPreferencesStore } from '@/shared/store/app-preferences.store';
import { useApplyTheme } from '@/shared/hooks/use-apply-theme';
import { useSignOut } from '@/features/auth/hooks';
import { getTaskStats } from '../utils/task.utils';
import { TaskStats, ViewToggle, RetentionConfig } from '../components';
import { TaskListContainer } from './TaskListContainer';
import { CreateTaskContainer } from './CreateTaskContainer';
import { EditTaskContainer } from './EditTaskContainer';

export function TaskDashboardContainer() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data } = useTasks();
  const { signOut, isPending: isSigningOut } = useSignOut();
  const openCreateModal = useTaskUIStore((s) => s.openCreateModal);
  const theme = useAppPreferencesStore((s) => s.theme);
  const setTheme = useAppPreferencesStore((s) => s.setTheme);
  const viewMode = useTaskUIStore((s) => s.viewMode);
  const setViewMode = useTaskUIStore((s) => s.setViewMode);
  const retentionPolicy = useAppPreferencesStore((s) => s.retentionPolicy);
  const setRetentionPolicy = useAppPreferencesStore(
    (s) => s.setRetentionPolicy,
  );

  useApplyTheme();

  async function handleSignOut() {
    await signOut();
    queryClient.clear();
    navigate('/');
  }

  function handleToggleTheme() {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }

  const stats = useMemo(() => getTaskStats(data?.tasks ?? []), [data]);
  const totalTasks = data?.tasks?.length ?? 0;

  useAutoPurge(data?.tasks ?? []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Task Manager
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {totalTasks === 0
                ? 'No tasks yet'
                : `${totalTasks} task${totalTasks === 1 ? '' : 's'} total`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
            <RetentionConfig
              retentionPolicy={retentionPolicy}
              onRetentionChange={setRetentionPolicy}
            />
            <button
              type="button"
              onClick={handleToggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-lg shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
              aria-label={
                theme === 'dark'
                  ? 'Switch to light mode'
                  : 'Switch to dark mode'
              }
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              {isSigningOut ? 'Signing out...' : 'Sign out'}
            </button>
            <button
              type="button"
              onClick={openCreateModal}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <span aria-hidden="true">+</span>
              New Task
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <TaskStats stats={stats} />
          <TaskListContainer />
        </div>
      </div>

      <CreateTaskContainer />
      <EditTaskContainer />
    </div>
  );
}
