import { lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import {
  LoginContainer,
  RegisterContainer,
  ForgotPasswordContainer,
  ResetPasswordContainer,
  DemoLoginContainer,
} from '@/features/auth';
import { LandingPage } from '@/features/landing';
import {
  PrivacyPage,
  TermsPage,
  CookiesPage,
  LegalNoticePage,
} from '@/features/legal';
import { AppShellContainer } from '@/shared/components/app-shell';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicOnlyRoute } from './PublicOnlyRoute';
import { PublicAuthLayout } from './PublicAuthLayout';
import { ScrollToTop } from './ScrollToTop';

const InboxDashboardContainer = lazy(() =>
  import('@/features/inbox/containers/InboxDashboardContainer').then((m) => ({
    default: m.InboxDashboardContainer,
  })),
);
const TaskDashboardContainer = lazy(() =>
  import('@/features/task-manager/containers/TaskDashboardContainer').then(
    (m) => ({ default: m.TaskDashboardContainer }),
  ),
);
const TaskDetailContainer = lazy(() =>
  import('@/features/task-manager/containers/TaskDetailContainer').then(
    (m) => ({
      default: m.TaskDetailContainer,
    }),
  ),
);
const RecurrenceDashboardContainer = lazy(() =>
  import('@/features/recurrences/containers/RecurrenceDashboardContainer').then(
    (m) => ({ default: m.RecurrenceDashboardContainer }),
  ),
);
const ReportDashboardContainer = lazy(() =>
  import('@/features/task-manager/containers/ReportDashboardContainer').then(
    (m) => ({ default: m.ReportDashboardContainer }),
  ),
);
const SettingsContainer = lazy(() =>
  import('@/features/settings/containers/SettingsContainer').then((m) => ({
    default: m.SettingsContainer,
  })),
);
const AccountContainer = lazy(() =>
  import('@/features/account/containers/AccountContainer').then((m) => ({
    default: m.AccountContainer,
  })),
);

export function Router() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={
            <PublicOnlyRoute>
              <LandingPage />
            </PublicOnlyRoute>
          }
        />
        {/* Auth modal routes (landing page as background + modal overlay) */}
        <Route
          element={
            <PublicOnlyRoute>
              <PublicAuthLayout />
            </PublicOnlyRoute>
          }
        >
          <Route path="/login" element={<LoginContainer />} />
          <Route path="/register" element={<RegisterContainer />} />
          <Route
            path="/forgot-password"
            element={<ForgotPasswordContainer />}
          />
        </Route>

        {/* Reset password stays standalone (accessed via email link) */}
        <Route path="/reset-password" element={<ResetPasswordContainer />} />

        {/* Demo login — direct route, no layout wrapper */}
        <Route path="/demo" element={<DemoLoginContainer />} />

        {/* Legal pages — universally accessible */}
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/cookies" element={<CookiesPage />} />
        <Route path="/legal" element={<LegalNoticePage />} />

        {/* Protected routes with App Shell */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppShellContainer />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="tasks" replace />} />
          <Route path="inbox" element={<InboxDashboardContainer />} />
          <Route path="tasks" element={<TaskDashboardContainer />} />
          <Route path="tasks/:id" element={<TaskDetailContainer />} />
          <Route
            path="recurrences"
            element={<RecurrenceDashboardContainer />}
          />
          <Route path="reports" element={<ReportDashboardContainer />} />
          <Route path="account" element={<AccountContainer />} />
          <Route path="settings" element={<SettingsContainer />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
