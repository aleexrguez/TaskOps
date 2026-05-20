import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { changePasswordInputSchema } from '../types/profile.types';

interface ChangePasswordFormProps {
  onSubmit: (password: string) => void;
  isPending: boolean;
  error: string | null;
  isSuccess: boolean;
  onReset: () => void;
}

export function ChangePasswordForm({
  onSubmit,
  isPending,
  error,
  isSuccess,
  onReset,
}: ChangePasswordFormProps) {
  const { t } = useTranslation('account');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationErrors({});
    onReset();

    const result = changePasswordInputSchema.safeParse({
      password,
      confirmPassword,
    });

    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path.join('.');
        errors[key] = issue.message;
      }
      setValidationErrors(errors);
      return;
    }

    onSubmit(password);
  }

  // Clear form on success
  if (isSuccess && (password || confirmPassword)) {
    setPassword('');
    setConfirmPassword('');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="new-password"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {t('password.newPassword')}
        </label>
        <input
          id="new-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          aria-describedby={
            validationErrors.password ? 'password-error' : undefined
          }
          aria-invalid={!!validationErrors.password}
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
        {validationErrors.password && (
          <p
            id="password-error"
            className="mt-1 text-xs text-red-600 dark:text-red-400"
            role="alert"
          >
            {validationErrors.password}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="confirm-password"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {t('password.confirmPassword')}
        </label>
        <input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          aria-describedby={
            validationErrors.confirmPassword
              ? 'confirm-password-error'
              : undefined
          }
          aria-invalid={!!validationErrors.confirmPassword}
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
        {validationErrors.confirmPassword && (
          <p
            id="confirm-password-error"
            className="mt-1 text-xs text-red-600 dark:text-red-400"
            role="alert"
          >
            {validationErrors.confirmPassword}
          </p>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      {isSuccess && (
        <p className="text-sm text-green-600 dark:text-green-400" role="status">
          {t('password.success')}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="cursor-pointer rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? t('password.changing') : t('password.submit')}
      </button>
    </form>
  );
}
