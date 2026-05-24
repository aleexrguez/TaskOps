import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { registerInputSchema } from '../types';
import type { RegisterInput } from '../types';
import { SocialLoginButton, GoogleIcon } from './SocialLoginButton';
import { AuthDivider } from './AuthDivider';

interface RegisterFormProps {
  onSubmit: (data: RegisterInput) => void;
  isPending: boolean;
  error: string | null;
  isSuccess?: boolean;
  onGoogleSignIn?: () => void;
  isGooglePending?: boolean;
  googleError?: string | null;
}

interface FormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export function RegisterForm({
  onSubmit,
  isPending,
  error,
  isSuccess,
  onGoogleSignIn,
  isGooglePending,
  googleError,
}: RegisterFormProps) {
  const { t } = useTranslation('auth');
  const [fields, setFields] = useState<FormState>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const inputClass =
    'rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400';

  const labelClass = 'text-sm font-medium text-gray-700 dark:text-gray-300';

  function handleChange(e: ChangeEvent<HTMLInputElement>): void {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    const result = registerInputSchema.safeParse(fields);
    if (!result.success) {
      const errors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof FieldErrors;
        errors[field] =
          issue.message === 'Passwords do not match'
            ? t('validation.passwordsDoNotMatch')
            : issue.message;
      }
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    onSubmit(result.data);
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-900/20">
          <p className="text-sm font-medium text-green-700 dark:text-green-400">
            {t('register.successHeading')}
          </p>
          <p className="mt-1 text-sm text-green-600 dark:text-green-400">
            {t('register.successMessage')}
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
      {googleError && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-900/20"
        >
          <p className="text-sm text-red-700 dark:text-red-400">
            {googleError}
          </p>
        </div>
      )}

      {onGoogleSignIn && (
        <>
          <SocialLoginButton
            label={t('social.continueWithGoogle')}
            pendingLabel={t('social.googlePending')}
            onClick={onGoogleSignIn}
            isPending={isGooglePending ?? false}
            icon={<GoogleIcon />}
          />
          <AuthDivider text={t('social.divider')} />
        </>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-900/20"
        >
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="name" className={labelClass}>
          {t('register.nameLabel')}
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          value={fields.name}
          onChange={handleChange}
          className={inputClass}
          placeholder={t('register.namePlaceholder')}
        />
        {fieldErrors.name && (
          <p className="text-xs text-red-600 dark:text-red-400">
            {fieldErrors.name}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className={labelClass}>
          {t('register.emailLabel')}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={fields.email}
          onChange={handleChange}
          className={inputClass}
          placeholder={t('register.emailPlaceholder')}
        />
        {fieldErrors.email && (
          <p className="text-xs text-red-600 dark:text-red-400">
            {fieldErrors.email}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className={labelClass}>
          {t('register.passwordLabel')}
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
            placeholder={t('register.passwordPlaceholder')}
          />
          <button
            type="button"
            aria-label={
              showPassword
                ? t('register.hidePassword')
                : t('register.showPassword')
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
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="confirmPassword" className={labelClass}>
          {t('register.confirmPasswordLabel')}
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            required
            minLength={6}
            value={fields.confirmPassword}
            onChange={handleChange}
            className={`${inputClass} w-full pr-10`}
            placeholder={t('register.passwordPlaceholder')}
          />
          <button
            type="button"
            aria-label={
              showConfirmPassword
                ? t('register.hidePassword')
                : t('register.showPassword')
            }
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <img
              src={
                showConfirmPassword ? '/HidePassword.png' : '/ShowPassword.png'
              }
              alt=""
              className="h-5 w-5"
            />
          </button>
        </div>
        {fieldErrors.confirmPassword && (
          <p className="text-xs text-red-600 dark:text-red-400">
            {fieldErrors.confirmPassword}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending || isGooglePending}
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
      >
        {isPending ? t('register.submitting') : t('register.submit')}
      </button>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        {t('register.hasAccount')}{' '}
        <Link
          to="/login"
          className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          {t('register.login')}
        </Link>
      </p>
    </form>
  );
}
