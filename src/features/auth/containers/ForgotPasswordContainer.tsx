import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useResetPassword } from '../hooks';
import { ForgotPasswordForm } from '../components';
import { useApplyTheme } from '@/shared/hooks/use-apply-theme';

import { AuthModal } from '@/shared/components/AuthModal';
import type { ForgotPasswordInput } from '../types';

export function ForgotPasswordContainer() {
  useApplyTheme();
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const { resetPassword, isPending, error, isSuccess } = useResetPassword();

  function handleSubmit(data: ForgotPasswordInput): void {
    resetPassword(data.email);
  }

  return (
    <AuthModal
      title={t('forgotPassword.heading')}
      onClose={() => navigate('/')}
    >
      <h1 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
        {t('forgotPassword.heading')}
      </h1>
      <ForgotPasswordForm
        onSubmit={handleSubmit}
        isPending={isPending}
        error={error}
        isSuccess={isSuccess}
      />
    </AuthModal>
  );
}
