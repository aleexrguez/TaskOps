import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSignIn } from '../hooks';
import { LoginForm } from '../components';
import { useApplyTheme } from '@/shared/hooks/use-apply-theme';
import { LanguageToggle } from '@/shared/components/LanguageToggle';
import { AuthPageLayout } from '@/shared/components/AuthPageLayout';
import type { LoginInput } from '../types';

export function LoginContainer() {
  useApplyTheme();
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const { signIn, isPending, error } = useSignIn();

  async function handleSubmit(data: LoginInput): Promise<void> {
    try {
      await signIn(data.email, data.password);
      navigate('/app');
    } catch {
      // error is already set in the hook
    }
  }

  return (
    <AuthPageLayout>
      <div className="w-full max-w-sm">
        <div className="mb-4 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            &larr; {t('backToHome')}
          </Link>
          <LanguageToggle />
        </div>
        <div className="rounded-lg bg-white p-8 shadow-xl dark:bg-gray-800">
          <h1 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t('login.heading')}
          </h1>
          <LoginForm
            onSubmit={handleSubmit}
            isPending={isPending}
            error={error}
          />
        </div>
      </div>
    </AuthPageLayout>
  );
}
