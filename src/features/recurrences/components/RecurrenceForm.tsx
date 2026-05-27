import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import type { CreateRecurrenceInput } from '../types/recurrence.types';
import type { RecurrenceFrequency } from '../types/recurrence.types';
import type { TaskPriority } from '@/features/task-manager/types/task.types';
import {
  getNextOccurrences,
  getIntervalHelperText,
  parseDateKey,
} from '../utils/recurrence.utils';
import { DatePicker } from '@/shared/components/DatePicker';
import { WeeklyDaysPicker } from './WeeklyDaysPicker';

interface RecurrenceFormProps {
  onSubmit: (data: CreateRecurrenceInput) => void;
  initialValues?: Partial<CreateRecurrenceInput>;
  isSubmitting?: boolean;
  submitLabel?: string;
  autoFocusTitle?: boolean;
}

interface FormState {
  title: string;
  description: string;
  priority: TaskPriority;
  frequency: RecurrenceFrequency;
  weeklyDays: number[];
  monthlyDay: string;
  leadTimeDays: string;
  interval: string;
  startDate: string;
}

function todayDateKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function buildInitialState(
  initial?: Partial<CreateRecurrenceInput>,
): FormState {
  return {
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    priority: initial?.priority ?? 'medium',
    frequency: initial?.frequency ?? 'daily',
    weeklyDays:
      initial?.frequency === 'weekly' && 'weeklyDays' in (initial ?? {})
        ? ((initial as { weeklyDays?: number[] }).weeklyDays ?? [])
        : [],
    monthlyDay:
      initial?.frequency === 'monthly' && 'monthlyDay' in (initial ?? {})
        ? String((initial as { monthlyDay?: number }).monthlyDay ?? 1)
        : '1',
    leadTimeDays:
      (initial?.frequency === 'monthly' || initial?.frequency === 'weekly') &&
      'leadTimeDays' in (initial ?? {})
        ? String((initial as { leadTimeDays?: number }).leadTimeDays ?? 0)
        : '0',
    interval:
      'interval' in (initial ?? {})
        ? String((initial as { interval?: number }).interval ?? 1)
        : '1',
    startDate:
      'startDate' in (initial ?? {})
        ? ((initial as { startDate?: string }).startDate ?? todayDateKey())
        : todayDateKey(),
  };
}

function formatPreviewDate(dateKey: string, locale: string): string {
  const date = parseDateKey(dateKey);
  const dateLocale = locale === 'es' ? 'es-AR' : 'en-US';
  return date.toLocaleDateString(dateLocale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

const inputClass =
  'min-h-[44px] rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100';

const labelClass = 'text-sm font-medium text-gray-700 dark:text-gray-300';

export function RecurrenceForm({
  onSubmit,
  initialValues,
  isSubmitting = false,
  submitLabel = 'Submit',
  autoFocusTitle = false,
}: RecurrenceFormProps) {
  const { t, i18n } = useTranslation('recurrence');
  const titleRef = useRef<HTMLInputElement>(null);
  const hasUserEditedMonthlyDay = useRef(
    initialValues?.frequency === 'monthly' &&
      'monthlyDay' in (initialValues ?? {}),
  );
  const [fields, setFields] = useState<FormState>(() =>
    buildInitialState(initialValues),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const nextDates = useMemo(() => {
    if (!fields.startDate) return [];
    const intervalNum = Number(fields.interval);
    if (isNaN(intervalNum) || intervalNum < 1) return [];
    if (fields.frequency === 'weekly' && fields.weeklyDays.length === 0)
      return [];
    if (fields.frequency === 'monthly') {
      const md = Number(fields.monthlyDay);
      if (isNaN(md) || md < 1 || md > 31) return [];
    }

    return getNextOccurrences(
      {
        frequency: fields.frequency,
        interval: intervalNum,
        startDate: fields.startDate,
        weeklyDays:
          fields.frequency === 'weekly' ? fields.weeklyDays : undefined,
        monthlyDay:
          fields.frequency === 'monthly'
            ? Number(fields.monthlyDay)
            : undefined,
      },
      5,
    );
  }, [
    fields.frequency,
    fields.interval,
    fields.startDate,
    fields.weeklyDays,
    fields.monthlyDay,
  ]);

  useEffect(() => {
    if (autoFocusTitle) {
      titleRef.current?.focus();
    }
  }, [autoFocusTitle]);

  function autofillMonthlyDay(
    frequency: RecurrenceFrequency,
    startDate: string,
  ): Partial<FormState> {
    if (
      frequency === 'monthly' &&
      !hasUserEditedMonthlyDay.current &&
      startDate
    ) {
      const date = parseDateKey(startDate);
      return { monthlyDay: String(date.getDate()) };
    }
    return {};
  }

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ): void {
    const { name, value } = e.target;
    if (name === 'monthlyDay') {
      hasUserEditedMonthlyDay.current = true;
    }
    setFields((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'frequency') {
        const newFreq = value as RecurrenceFrequency;
        if (newFreq === 'daily') {
          next.leadTimeDays = '0';
        } else if (newFreq === 'weekly') {
          const current = Number(next.leadTimeDays);
          if (current > 7) next.leadTimeDays = '7';
        }
        Object.assign(next, autofillMonthlyDay(newFreq, prev.startDate));
      }
      return next;
    });
    setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function handleWeeklyDaysChange(days: number[]): void {
    setFields((prev) => ({ ...prev, weeklyDays: days }));
    setErrors((prev) => ({ ...prev, weeklyDays: '' }));
  }

  function handleStartDateChange(date: string | undefined): void {
    const startDate = date ?? '';
    setFields((prev) => ({
      ...prev,
      startDate,
      ...autofillMonthlyDay(prev.frequency, startDate),
    }));
    setErrors((prev) => ({ ...prev, startDate: '' }));
  }

  function validate(): boolean {
    const next: Record<string, string> = {};

    if (!fields.title.trim()) {
      next.title = t('validation.titleRequired');
    }

    if (fields.frequency === 'weekly' && fields.weeklyDays.length === 0) {
      next.weeklyDays = t('validation.selectDay');
    }

    if (
      fields.frequency === 'monthly' &&
      (isNaN(Number(fields.monthlyDay)) ||
        Number(fields.monthlyDay) < 1 ||
        Number(fields.monthlyDay) > 31)
    ) {
      next.monthlyDay = t('validation.monthlyDayRange');
    }

    if (
      isNaN(Number(fields.interval)) ||
      Number(fields.interval) < 1 ||
      Number(fields.interval) > 365
    ) {
      next.interval = t('validation.intervalRange');
    }

    if (!fields.startDate) {
      next.startDate = t('validation.startDateRequired');
    }

    if (fields.frequency !== 'daily') {
      const maxLead = fields.frequency === 'weekly' ? 7 : 14;
      const leadVal = Number(fields.leadTimeDays);
      if (isNaN(leadVal) || leadVal < 0 || leadVal > maxLead) {
        next.leadTimeDays = t('validation.leadTimeDaysRange', { max: maxLead });
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    if (!validate()) return;

    let payload: CreateRecurrenceInput;

    const normalizedDescription = fields.description?.trim() ?? '';
    const descriptionField = normalizedDescription
      ? { description: normalizedDescription }
      : {};
    const intervalNum = Number(fields.interval);

    if (fields.frequency === 'daily') {
      payload = {
        frequency: 'daily',
        title: fields.title,
        priority: fields.priority,
        interval: intervalNum,
        startDate: fields.startDate,
        ...descriptionField,
      };
    } else if (fields.frequency === 'weekly') {
      payload = {
        frequency: 'weekly',
        title: fields.title,
        priority: fields.priority,
        weeklyDays: fields.weeklyDays,
        leadTimeDays: Number(fields.leadTimeDays),
        interval: intervalNum,
        startDate: fields.startDate,
        ...descriptionField,
      };
    } else {
      payload = {
        frequency: 'monthly',
        title: fields.title,
        priority: fields.priority,
        monthlyDay: Number(fields.monthlyDay),
        leadTimeDays: Number(fields.leadTimeDays),
        interval: intervalNum,
        startDate: fields.startDate,
        ...descriptionField,
      };
    }

    onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* ---- Left column: base fields ---- */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="title" className={labelClass}>
              {t('form.titleLabel')} <span className="text-red-500">*</span>
            </label>
            <input
              ref={titleRef}
              id="title"
              name="title"
              type="text"
              value={fields.title}
              onChange={handleChange}
              className={inputClass}
              placeholder={t('form.titlePlaceholder')}
            />
            {errors.title && (
              <p className="text-xs text-red-500">{errors.title}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="description" className={labelClass}>
              {t('form.descriptionLabel')}
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={fields.description}
              onChange={handleChange}
              className={inputClass}
              placeholder={t('form.descriptionPlaceholder')}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="priority" className={labelClass}>
              {t('common:form.priority')}
            </label>
            <select
              id="priority"
              name="priority"
              value={fields.priority}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="low">{t('common:priority.low')}</option>
              <option value="medium">{t('common:priority.medium')}</option>
              <option value="high">{t('common:priority.high')}</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="frequency" className={labelClass}>
              {t('form.frequencyLabel')}
            </label>
            <select
              id="frequency"
              name="frequency"
              value={fields.frequency}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="daily">{t('form.frequency.daily')}</option>
              <option value="weekly">{t('form.frequency.weekly')}</option>
              <option value="monthly">{t('form.frequency.monthly')}</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="interval" className={labelClass}>
              {t('form.repeatEvery')}
            </label>
            <div className="flex items-center gap-2">
              <input
                id="interval"
                name="interval"
                type="number"
                min={1}
                max={365}
                value={fields.interval}
                onChange={handleChange}
                className={`${inputClass} w-20`}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {fields.frequency === 'daily' &&
                  t('form.intervalUnit.day', {
                    count: Number(fields.interval),
                  })}
                {fields.frequency === 'weekly' &&
                  t('form.intervalUnit.week', {
                    count: Number(fields.interval),
                  })}
                {fields.frequency === 'monthly' &&
                  t('form.intervalUnit.month', {
                    count: Number(fields.interval),
                  })}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {getIntervalHelperText(fields.frequency, t)}
            </p>
            {errors.interval && (
              <p className="text-xs text-red-500">{errors.interval}</p>
            )}
          </div>

          <DatePicker
            id="startDate"
            label={t('form.startingFrom')}
            value={fields.startDate || undefined}
            onChange={handleStartDateChange}
          />
          {errors.startDate && (
            <p className="text-xs text-red-500">{errors.startDate}</p>
          )}
        </div>

        {/* ---- Right column: frequency-specific + preview ---- */}
        <div className="flex flex-col gap-4">
          {fields.frequency === 'weekly' && (
            <div className="flex flex-col gap-1">
              <span className={labelClass}>{t('form.daysOfWeek')}</span>
              <WeeklyDaysPicker
                selectedDays={fields.weeklyDays}
                onChange={handleWeeklyDaysChange}
              />
              {errors.weeklyDays && (
                <p className="text-xs text-red-500">{errors.weeklyDays}</p>
              )}
            </div>
          )}

          {fields.frequency === 'monthly' && (
            <div className="flex flex-col gap-1">
              <label htmlFor="monthlyDay" className={labelClass}>
                {t('form.monthlyDay')}
              </label>
              <input
                id="monthlyDay"
                name="monthlyDay"
                type="number"
                min={1}
                max={31}
                value={fields.monthlyDay}
                onChange={handleChange}
                className={inputClass}
              />
              {errors.monthlyDay && (
                <p className="text-xs text-red-500">{errors.monthlyDay}</p>
              )}
            </div>
          )}

          {fields.frequency !== 'daily' && (
            <div className="flex flex-col gap-1">
              <label htmlFor="leadTimeDays" className={labelClass}>
                {t('form.leadTimeDays')}
              </label>
              <input
                id="leadTimeDays"
                name="leadTimeDays"
                type="number"
                min={0}
                max={fields.frequency === 'weekly' ? 7 : 14}
                value={fields.leadTimeDays}
                onChange={handleChange}
                className={inputClass}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('form.leadTimeDaysHelper', {
                  max: fields.frequency === 'weekly' ? 7 : 14,
                })}
              </p>
              {errors.leadTimeDays && (
                <p className="text-xs text-red-500">{errors.leadTimeDays}</p>
              )}
            </div>
          )}

          {nextDates.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className={labelClass}>{t('form.nextOccurrences')}</span>
              <ul
                className="flex flex-wrap gap-2"
                aria-label={t('form.nextOccurrences')}
              >
                {nextDates.map((dateKey) => (
                  <li
                    key={dateKey}
                    className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                  >
                    {formatPreviewDate(dateKey, i18n.resolvedLanguage ?? 'en')}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 border-t border-gray-200 bg-white pt-4 dark:border-gray-700 dark:bg-gray-800">
        <button
          type="submit"
          disabled={isSubmitting}
          className="min-h-[44px] w-full cursor-pointer rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? `${submitLabel}...` : submitLabel}
        </button>
      </div>
    </form>
  );
}
