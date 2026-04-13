import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '@/features/auth/hooks';

interface Props {
  children: ReactNode;
  fallback?: string;
}

export function PublicOnlyRoute({ children, fallback = '/app' }: Props) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        role="status"
        aria-label="Loading"
        className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900"
      >
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-indigo-600" />
      </div>
    );
  }

  if (user) return <Navigate to={fallback} replace />;

  return <>{children}</>;
}
