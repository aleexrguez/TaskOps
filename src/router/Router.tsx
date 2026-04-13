import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import {
  TaskDashboardContainer,
  TaskDetailContainer,
} from '@/features/task-manager/containers';
import { LoginContainer, RegisterContainer } from '@/features/auth';
import { LandingPage } from '@/features/landing';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicOnlyRoute } from './PublicOnlyRoute';

export function Router() {
  return (
    <BrowserRouter>
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
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginContainer />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <RegisterContainer />
            </PublicOnlyRoute>
          }
        />

        {/* Protected routes */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <TaskDashboardContainer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/tasks/:id"
          element={
            <ProtectedRoute>
              <TaskDetailContainer />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
