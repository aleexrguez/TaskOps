import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAppPreferencesStore } from '@/shared/store/app-preferences.store';
import { useSignOut, useAuth } from '@/features/auth/hooks';
import { useApplyTheme } from '@/shared/hooks/use-apply-theme';
import { usePWAUpdate } from '@/shared/hooks/use-pwa-update';
import { useTasks } from '@/features/task-manager/hooks/use-tasks';
import { useRecurrences } from '@/features/recurrences/hooks/use-recurrences';
import { useAutoGenerate } from '@/features/recurrences/hooks/use-auto-generate';
import { useProfile } from '@/features/account/hooks/use-profile';
import { getAvatarPublicUrl } from '@/features/account/api/profile.api';
import { AppShellLayout } from './AppShellLayout';
import { ReminderContainerCtrl } from '@/features/task-manager/containers/ReminderContainerCtrl';
import type { NavItem } from './app-shell.types';

const INBOX_ICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%236366f1' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='22 12 16 12 14 15 10 15 8 12 2 12'/%3E%3Cpath d='M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z'/%3E%3C/svg%3E";

const REPORTS_ICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%236366f1' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3 3v18h18'/%3E%3Cpath d='M7 16l4-8 4 4 4-8'/%3E%3C/svg%3E";

const ACCOUNT_ICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%236366f1' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='12' cy='7' r='4'/%3E%3C/svg%3E";

const NAV_ITEMS: NavItem[] = [
  { label: 'Inbox', to: '/app/inbox', icon: INBOX_ICON },
  { label: 'Tasks', to: '/app/tasks', icon: '/TaskIcon.png' },
  { label: 'Recurrences', to: '/app/recurrences', icon: '/RecurrenceIcon.png' },
  { label: 'Reports', to: '/app/reports', icon: REPORTS_ICON },
  { label: 'Account', to: '/app/account', icon: ACCOUNT_ICON },
  { label: 'Settings', to: '/app/settings', icon: '/SettingsIcon.png' },
];

export function AppShellContainer() {
  useApplyTheme();
  const { needRefresh, updateServiceWorker, dismissUpdate } = usePWAUpdate();

  const { data: tasksData } = useTasks();
  const { data: recurrencesData } = useRecurrences();
  useAutoGenerate(recurrencesData?.recurrences ?? [], tasksData?.tasks ?? []);

  const isSidebarCollapsed = useAppPreferencesStore(
    (s) => s.isSidebarCollapsed,
  );
  const toggleSidebar = useAppPreferencesStore((s) => s.toggleSidebar);
  const animatedBackground = useAppPreferencesStore(
    (s) => s.animatedBackground,
  );

  const { signOut, isPending: isSigningOut } = useSignOut();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const avatarUrl = profile?.avatar_path
    ? getAvatarPublicUrl(profile.avatar_path)
    : null;

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    queryClient.clear();
    navigate('/');
  }

  return (
    <>
      <AppShellLayout
        animatedBackground={animatedBackground}
        headerProps={{
          appName: 'TaskOps',
          isCollapsed: isSidebarCollapsed,
          onToggleMobileSidebar: () => setIsMobileSidebarOpen(true),
          userMenu: {
            displayName: profile?.display_name ?? null,
            email: user?.email ?? '',
            avatarUrl,
            onSignOut: handleSignOut,
            isSigningOut,
          },
        }}
        pwaUpdateProps={
          needRefresh
            ? {
                onUpdate: () => updateServiceWorker(true),
                onDismiss: dismissUpdate,
              }
            : undefined
        }
        sidebarProps={{
          navItems: NAV_ITEMS,
          isCollapsed: isSidebarCollapsed,
          onToggleCollapse: toggleSidebar,
          isMobileOpen: isMobileSidebarOpen,
          onCloseMobile: () => setIsMobileSidebarOpen(false),
          onSignOut: handleSignOut,
          isSigningOut,
        }}
      />
      <ReminderContainerCtrl tasks={tasksData?.tasks ?? []} />
    </>
  );
}
