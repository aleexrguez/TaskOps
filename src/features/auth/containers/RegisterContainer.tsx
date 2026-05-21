import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSignUp } from '../hooks';
import { RegisterForm } from '../components';
import { useApplyTheme } from '@/shared/hooks/use-apply-theme';
import { LanguageToggle } from '@/shared/components/LanguageToggle';
import type { RegisterInput } from '../types';

export function RegisterContainer() {
  useApplyTheme();
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const { signUp, isPending, error } = useSignUp();

  async function handleSubmit(data: RegisterInput): Promise<void> {
    try {
      await signUp(data.email, data.password);
      navigate('/app');
    } catch {
      // error is already set in the hook
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
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
            {t('register.heading')}
          </h1>
          <RegisterForm
            onSubmit={handleSubmit}
            isPending={isPending}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}
