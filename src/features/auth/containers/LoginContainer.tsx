import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSignIn } from '../hooks';
import { LoginForm } from '../components';
import { useApplyTheme } from '@/shared/hooks/use-apply-theme';

import { AuthModal } from '@/shared/components/AuthModal';
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
    <AuthModal title={t('login.heading')} onClose={() => navigate('/')}>
      <h1 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
        {t('login.heading')}
      </h1>
      <LoginForm onSubmit={handleSubmit} isPending={isPending} error={error} />
    </AuthModal>
  );
}
