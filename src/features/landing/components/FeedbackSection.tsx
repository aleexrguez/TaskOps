import { useReducer, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FEEDBACK_CATEGORIES,
  submitFeedbackInputSchema,
  type FeedbackCategory,
  type SubmitFeedbackInput,
} from '../types/feedback.types';

const COOLDOWN_MS = 30_000;
const COOLDOWN_KEY = 'feedback_cooldown_until';

export interface FeedbackSectionProps {
  onSubmit: (data: SubmitFeedbackInput) => void;
  isPending: boolean;
  isSuccess: boolean;
}

interface ValidationErrors {
  message?: string;
  email?: string;
}

interface FormState {
  message: string;
  category: FeedbackCategory;
  email: string;
  honeypot: string;
  errors: ValidationErrors;
  cooldownSeconds: number;
}

type FormAction =
  | { type: 'SET_MESSAGE'; value: string }
  | { type: 'SET_CATEGORY'; value: FeedbackCategory }
  | { type: 'SET_EMAIL'; value: string }
  | { type: 'SET_HONEYPOT'; value: string }
  | { type: 'SET_ERRORS'; errors: ValidationErrors }
  | { type: 'RESET' }
  | { type: 'TICK' };

function getRemainingSeconds(): number {
  const raw = sessionStorage.getItem(COOLDOWN_KEY);
  if (!raw) return 0;
  const until = parseInt(raw, 10);
  if (isNaN(until)) return 0;
  return Math.max(0, Math.ceil((until - Date.now()) / 1000));
}

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_MESSAGE':
      return { ...state, message: action.value };
    case 'SET_CATEGORY':
      return { ...state, category: action.value };
    case 'SET_EMAIL':
      return { ...state, email: action.value };
    case 'SET_HONEYPOT':
      return { ...state, honeypot: action.value };
    case 'SET_ERRORS':
      return { ...state, errors: action.errors };
    case 'RESET':
      return {
        message: '',
        category: 'bug',
        email: '',
        honeypot: '',
        errors: {},
        cooldownSeconds: getRemainingSeconds(),
      };
    case 'TICK': {
      const remaining = getRemainingSeconds();
      if (remaining <= 0) sessionStorage.removeItem(COOLDOWN_KEY);
      return { ...state, cooldownSeconds: remaining };
    }
  }
}

export function FeedbackSection({
  onSubmit,
  isPending,
  isSuccess,
}: FeedbackSectionProps) {
  const { t } = useTranslation('landing');

  const [state, dispatch] = useReducer(
    formReducer,
    undefined,
    (): FormState => ({
      message: '',
      category: 'bug',
      email: '',
      honeypot: '',
      errors: {},
      cooldownSeconds: getRemainingSeconds(),
    }),
  );

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Manage the countdown interval. Runs after every render; the guard on
  // intervalRef prevents duplicate intervals. Only sets state from the
  // interval callback, not from the effect body itself.
  useEffect(() => {
    const hasActiveCooldown = getRemainingSeconds() > 0;

    if (hasActiveCooldown && !intervalRef.current) {
      intervalRef.current = setInterval(() => {
        dispatch({ type: 'TICK' });
        if (getRemainingSeconds() <= 0 && intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }, 1000);
    }

    if (!hasActiveCooldown && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  });

  // On the rising edge of isSuccess: write the cooldown expiry to
  // sessionStorage (so the countdown persists across remounts) then reset
  // the form. dispatch is stable and allowed inside useEffect by the linter.
  useEffect(() => {
    if (!isSuccess) return;
    sessionStorage.setItem(COOLDOWN_KEY, String(Date.now() + COOLDOWN_MS));
    dispatch({ type: 'RESET' });
  }, [isSuccess]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault();

    // Honeypot check — silent reset, no signal to bots
    if (state.honeypot !== '') {
      dispatch({ type: 'RESET' });
      return;
    }

    const result = submitFeedbackInputSchema.safeParse({
      message: state.message,
      category: state.category,
      email: state.email,
    });

    if (!result.success) {
      const newErrors: ValidationErrors = {};
      const flat = result.error.flatten();
      if (flat.fieldErrors.message?.length) {
        const msg = flat.fieldErrors.message[0];
        if (msg.includes('1000') || msg.includes('max')) {
          newErrors.message = t('feedback.message.maxLength');
        } else {
          newErrors.message = t('feedback.message.required');
        }
      }
      if (flat.fieldErrors.email?.length) {
        newErrors.email = t('feedback.email.invalid');
      }
      dispatch({ type: 'SET_ERRORS', errors: newErrors });
      return;
    }

    dispatch({ type: 'SET_ERRORS', errors: {} });
    onSubmit(result.data);
  }

  const isCoolingDown = state.cooldownSeconds > 0;
  const isDisabled = isPending || isCoolingDown;

  function getSubmitLabel(): string {
    if (isCoolingDown)
      return t('feedback.cooldown', { seconds: state.cooldownSeconds });
    if (isPending) return t('feedback.submitting');
    return t('feedback.submit');
  }

  return (
    <section className="border-t border-indigo-100 bg-indigo-50 dark:border-t-indigo-900 dark:bg-indigo-950/30">
      <div className="mx-auto max-w-xl px-4 py-16">
        <div className="rounded-xl border border-indigo-200 bg-white p-6 shadow-sm dark:border-indigo-800 dark:bg-gray-800">
          <h2 className="mb-3 text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t('feedback.heading')}
          </h2>
          <p className="mb-8 text-center text-sm text-gray-600 dark:text-gray-400">
            {t('feedback.description')}
          </p>

          <form onSubmit={handleSubmit} noValidate className="relative">
            {/* Honeypot — hidden from real users */}
            <input
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              className="absolute opacity-0 h-0 w-0 overflow-hidden pointer-events-none"
              value={state.honeypot}
              onChange={(e) =>
                dispatch({ type: 'SET_HONEYPOT', value: e.target.value })
              }
            />

            {/* Message */}
            <div className="mb-4">
              <label
                htmlFor="feedback-message"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t('feedback.message.label')}
              </label>
              <textarea
                id="feedback-message"
                rows={4}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                placeholder={t('feedback.message.placeholder')}
                value={state.message}
                onChange={(e) =>
                  dispatch({ type: 'SET_MESSAGE', value: e.target.value })
                }
              />
              <div className="mt-1 flex items-start justify-between gap-2">
                {state.errors.message ? (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {state.errors.message}
                  </p>
                ) : (
                  <span />
                )}
                <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">
                  {state.message.length}/1000
                </span>
              </div>
            </div>

            {/* Category */}
            <div className="mb-4">
              <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('feedback.category.label')}
              </span>
              <div className="flex flex-wrap gap-2">
                {FEEDBACK_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() =>
                      dispatch({ type: 'SET_CATEGORY', value: cat })
                    }
                    className={
                      state.category === cat
                        ? 'rounded-md px-3 py-1.5 text-sm font-medium bg-indigo-600 text-white'
                        : 'rounded-md px-3 py-1.5 text-sm font-medium border border-gray-300 bg-white text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300'
                    }
                  >
                    {t(`feedback.category.${cat}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* Email */}
            <div className="mb-6">
              <label
                htmlFor="feedback-email"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t('feedback.email.label')}
              </label>
              <input
                id="feedback-email"
                type="email"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                placeholder={t('feedback.email.placeholder')}
                value={state.email}
                onChange={(e) =>
                  dispatch({ type: 'SET_EMAIL', value: e.target.value })
                }
              />
              {state.errors.email && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {state.errors.email}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isDisabled}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus:ring-offset-gray-900"
            >
              {getSubmitLabel()}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
