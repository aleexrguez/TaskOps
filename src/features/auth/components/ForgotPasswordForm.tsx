import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { forgotPasswordInputSchema } from '../types';
import type { ForgotPasswordInput } from '../types';

interface ForgotPasswordFormProps {
  onSubmit: (data: ForgotPasswordInput) => void;
  isPending: boolean;
  error: string | null;
  isSuccess: boolean;
}

export function ForgotPasswordForm({
  onSubmit,
  isPending,
  error,
  isSuccess,
}: ForgotPasswordFormProps) {
  const { t } = useTranslation('auth');
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState<string | undefined>();

  const inputClass =
    'min-h-[44px] rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400';

  const labelClass = 'text-sm font-medium text-gray-700 dark:text-gray-300';

  function handleChange(e: ChangeEvent<HTMLInputElement>): void {
    setEmail(e.target.value);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    const result = forgotPasswordInputSchema.safeParse({ email });
    if (!result.success) {
      setFieldError(result.error.issues[0]?.message);
      return;
    }
    setFieldError(undefined);
    onSubmit(result.data);
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-900/20">
          <p className="text-sm font-medium text-green-700 dark:text-green-400">
            {t('forgotPassword.successHeading')}
          </p>
          <p className="mt-1 text-sm text-green-600 dark:text-green-400">
            {t('forgotPassword.successMessage')}
          </p>
        </div>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            {t('backToLogin')}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {t('forgotPassword.instruction')}
      </p>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-900/20"
        >
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className={labelClass}>
          {t('forgotPassword.emailLabel')}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={email}
          onChange={handleChange}
          className={inputClass}
          placeholder={t('forgotPassword.emailPlaceholder')}
        />
        {fieldError && (
          <p className="text-xs text-red-600 dark:text-red-400">{fieldError}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="min-h-[44px] cursor-pointer rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
      >
        {isPending
          ? t('forgotPassword.submitting')
          : t('forgotPassword.submit')}
      </button>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        <Link
          to="/login"
          className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          {t('backToLogin')}
        </Link>
      </p>
    </form>
  );
}
