import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useResetPassword } from '../hooks';
import { ForgotPasswordForm } from '../components';
import { useApplyTheme } from '@/shared/hooks/use-apply-theme';
import { LanguageToggle } from '@/shared/components/LanguageToggle';
import { AuthPageLayout } from '@/shared/components/AuthPageLayout';
import type { ForgotPasswordInput } from '../types';

export function ForgotPasswordContainer() {
  useApplyTheme();
  const { t } = useTranslation('auth');
  const { resetPassword, isPending, error, isSuccess } = useResetPassword();

  function handleSubmit(data: ForgotPasswordInput): void {
    resetPassword(data.email);
  }

  return (
    <AuthPageLayout>
      <div className="w-full max-w-sm">
        <div className="mb-4 flex items-center justify-between">
          <Link
            to="/login"
            className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            &larr; {t('backToLogin')}
          </Link>
          <LanguageToggle />
        </div>
        <div className="rounded-lg bg-white p-8 shadow-xl dark:bg-gray-800">
          <h1 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t('forgotPassword.heading')}
          </h1>
          <ForgotPasswordForm
            onSubmit={handleSubmit}
            isPending={isPending}
            error={error}
            isSuccess={isSuccess}
          />
        </div>
      </div>
    </AuthPageLayout>
  );
}
