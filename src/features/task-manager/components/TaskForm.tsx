import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import type { CreateTaskInput, TaskStatus, TaskPriority } from '../types';
import { DatePicker } from '@/shared/components/DatePicker';

interface TaskFormProps {
  onSubmit: (data: CreateTaskInput) => void;
  initialValues?: Partial<CreateTaskInput>;
  isSubmitting?: boolean;
  submitLabel?: string;
  autoFocusTitle?: boolean;
}

interface FormState {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
}

function buildInitialState(initial?: Partial<CreateTaskInput>): FormState {
  return {
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    status: initial?.status ?? 'todo',
    priority: initial?.priority ?? 'medium',
    dueDate: initial?.dueDate ?? '',
  };
}

export function TaskForm({
  onSubmit,
  initialValues,
  isSubmitting = false,
  submitLabel = 'Submit',
  autoFocusTitle = false,
}: TaskFormProps) {
  const { t } = useTranslation();
  const titleRef = useRef<HTMLInputElement>(null);
  const [fields, setFields] = useState<FormState>(() =>
    buildInitialState(initialValues),
  );

  useEffect(() => {
    if (autoFocusTitle) {
      titleRef.current?.focus();
    }
  }, [autoFocusTitle]);

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ): void {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    const payload: CreateTaskInput = {
      title: fields.title,
      status: fields.status,
      priority: fields.priority,
    };
    const normalizedDescription = fields.description?.trim() ?? '';
    payload.description = normalizedDescription;
    if (fields.dueDate) payload.dueDate = fields.dueDate;
    onSubmit(payload);
  }

  const inputClass =
    'rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400';

  const labelClass = 'text-sm font-medium text-gray-700 dark:text-gray-300';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="title" className={labelClass}>
          {t('common:form.title')} <span className="text-red-500">*</span>
        </label>
        <input
          ref={titleRef}
          id="title"
          name="title"
          type="text"
          required
          value={fields.title}
          onChange={handleChange}
          className={inputClass}
          placeholder={t('common:form.titlePlaceholder')}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="description" className={labelClass}>
          {t('common:form.description')}
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={fields.description}
          onChange={handleChange}
          className={inputClass}
          placeholder={t('common:form.descriptionPlaceholder')}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="status" className={labelClass}>
          {t('common:form.status')}
        </label>
        <select
          id="status"
          name="status"
          value={fields.status}
          onChange={handleChange}
          className={inputClass}
        >
          <option value="todo">{t('common:status.todo')}</option>
          <option value="in-progress">{t('common:status.inProgress')}</option>
          <option value="done">{t('common:status.done')}</option>
        </select>
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
        <DatePicker
          id="dueDate"
          label={t('common:form.dueDate')}
          value={fields.dueDate || undefined}
          onChange={(date) =>
            setFields((prev) => ({ ...prev, dueDate: date ?? '' }))
          }
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="cursor-pointer rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
      >
        {isSubmitting ? `${submitLabel}...` : submitLabel}
      </button>
    </form>
  );
}
