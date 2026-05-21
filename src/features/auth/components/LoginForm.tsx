import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { loginInputSchema } from '../types';
import type { LoginInput } from '../types';

interface LoginFormProps {
  onSubmit: (data: LoginInput) => void;
  isPending: boolean;
  error: string | null;
}

interface FormState {
  email: string;
  password: string;
}

interface FieldErrors {
  email?: string;
  password?: string;
}

export function LoginForm({ onSubmit, isPending, error }: LoginFormProps) {
  const { t } = useTranslation('auth');
  const [fields, setFields] = useState<FormState>({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  const inputClass =
    'rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400';

  const labelClass = 'text-sm font-medium text-gray-700 dark:text-gray-300';

  function handleChange(e: ChangeEvent<HTMLInputElement>): void {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    const result = loginInputSchema.safeParse(fields);
    if (!result.success) {
      const errors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof FieldErrors;
        errors[field] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    onSubmit(result.data);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          {t('login.emailLabel')}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={fields.email}
          onChange={handleChange}
          className={inputClass}
          placeholder={t('login.emailPlaceholder')}
        />
        {fieldErrors.email && (
          <p className="text-xs text-red-600 dark:text-red-400">
            {fieldErrors.email}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className={labelClass}>
          {t('login.passwordLabel')}
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            minLength={6}
            value={fields.password}
            onChange={handleChange}
            className={`${inputClass} w-full pr-10`}
            placeholder={t('login.passwordPlaceholder')}
          />
          <button
            type="button"
            aria-label={
              showPassword ? t('login.hidePassword') : t('login.showPassword')
            }
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <img
              src={showPassword ? '/HidePassword.png' : '/ShowPassword.png'}
              alt=""
              className="h-5 w-5"
            />
          </button>
        </div>
        {fieldErrors.password && (
          <p className="text-xs text-red-600 dark:text-red-400">
            {fieldErrors.password}
          </p>
        )}
        <div className="mt-1 text-right">
          <Link
            to="/forgot-password"
            className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            {t('login.forgotPassword')}
          </Link>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="cursor-pointer rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
      >
        {isPending ? t('login.submitting') : t('login.submit')}
      </button>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        {t('login.noAccount')}{' '}
        <Link
          to="/register"
          className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          {t('login.register')}
        </Link>
      </p>
    </form>
  );
}
