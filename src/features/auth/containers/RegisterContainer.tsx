import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSignUp, useSignInWithGoogle } from '../hooks';
import { RegisterForm } from '../components';
import { useApplyTheme } from '@/shared/hooks/use-apply-theme';

import { AuthModal } from '@/shared/components/AuthModal';
import type { RegisterInput } from '../types';

export function RegisterContainer() {
  useApplyTheme();
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const { signUp, isPending, error, isSuccess } = useSignUp();
  const {
    signInWithGoogle,
    isPending: isGooglePending,
    error: googleError,
  } = useSignInWithGoogle();

  async function handleSubmit(data: RegisterInput): Promise<void> {
    try {
      const hasSession = await signUp(data.email, data.password, data.name);
      if (hasSession) {
        navigate('/app');
      }
    } catch {
      // error is already set in the hook
    }
  }

  return (
    <AuthModal title={t('register.heading')} onClose={() => navigate('/')}>
      <h1 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
        {t('register.heading')}
      </h1>
      <RegisterForm
        onSubmit={handleSubmit}
        isPending={isPending}
        error={error}
        isSuccess={isSuccess}
        onGoogleSignIn={signInWithGoogle}
        isGooglePending={isGooglePending}
        googleError={googleError}
      />
    </AuthModal>
  );
}
