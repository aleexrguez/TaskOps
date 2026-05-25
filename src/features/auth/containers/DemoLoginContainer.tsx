import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/hooks';
import { useIsDemoUser } from '@/shared/hooks/use-is-demo-user';
import { useApplyTheme } from '@/shared/hooks/use-apply-theme';
import { signIn, signOut } from '../api';

function FullPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      {children}
    </div>
  );
}

function Spinner({ label }: { label: string }) {
  return (
    <FullPageLayout>
      <div
        role="status"
        aria-label={label}
        className="flex flex-col items-center gap-4"
      >
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-indigo-600" />
        <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
      </div>
    </FullPageLayout>
  );
}

export function DemoLoginContainer() {
  useApplyTheme();
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const isDemoUser = useIsDemoUser();

  const [error, setError] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const demoEmail = import.meta.env.VITE_DEMO_EMAIL as string | undefined;
  const demoPassword = import.meta.env.VITE_DEMO_PASSWORD as string | undefined;

  useEffect(() => {
    if (isLoading || user) return;

    if (!demoEmail || !demoPassword) {
      setError(true);
      return;
    }

    async function runDemoLogin() {
      setIsLoggingIn(true);
      try {
        await signIn(demoEmail!, demoPassword!);
        navigate('/app', { replace: true });
      } catch {
        setError(true);
      } finally {
        setIsLoggingIn(false);
      }
    }

    runDemoLogin();
  }, [isLoading, user, demoEmail, demoPassword, navigate]);

  if (isLoading) {
    return <Spinner label={t('demo.loading')} />;
  }

  if (user && isDemoUser) {
    return <Navigate to="/app" replace />;
  }

  if (user && !isDemoUser) {
    async function handleSignOutAndTryDemo() {
      setIsLoggingIn(true);
      try {
        await signOut();
        await signIn(demoEmail!, demoPassword!);
        navigate('/app', { replace: true });
      } catch {
        setError(true);
      } finally {
        setIsLoggingIn(false);
      }
    }

    return (
      <FullPageLayout>
        <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
          <h1 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
            {t('demo.alreadySignedIn')}
          </h1>
          <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            {t('demo.alreadySignedInDesc')}
          </p>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => navigate('/app')}
              className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {t('demo.continueToApp')}
            </button>
            <button
              type="button"
              onClick={handleSignOutAndTryDemo}
              disabled={isLoggingIn}
              className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              {t('demo.signOutAndTryDemo')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {t('demo.backToHome')}
            </button>
          </div>
        </div>
      </FullPageLayout>
    );
  }

  if (error) {
    return (
      <FullPageLayout>
        <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
          <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
            {t('demo.error')}
          </p>
          <div className="flex gap-4">
            <a
              href="/register"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              {t('register.submit')}
            </a>
            <a
              href="/login"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              {t('login.submit')}
            </a>
          </div>
        </div>
      </FullPageLayout>
    );
  }

  return <Spinner label={t('demo.loading')} />;
}
