import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent, KeyboardEvent } from 'react';
import type { CreateTaskInput } from '@/features/task-manager/types/task.types';
import { DatePicker } from '@/shared/components/DatePicker';

export interface ConvertToTaskFormData {
  taskInput: CreateTaskInput;
  checklistTitles: string[];
}

interface ConvertToTaskFormProps {
  initialTitle: string;
  initialDescription: string;
  onSubmit: (data: ConvertToTaskFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

interface FormState {
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
}

export function ConvertToTaskForm({
  initialTitle,
  initialDescription,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ConvertToTaskFormProps) {
  const titleRef = useRef<HTMLInputElement>(null);
  const [fields, setFields] = useState<FormState>({
    title: initialTitle,
    description: initialDescription,
    status: 'todo',
    priority: 'medium',
    dueDate: '',
  });
  const [showChecklist, setShowChecklist] = useState(false);
  const [checklistItems, setChecklistItems] = useState<string[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
  }

  function handleAddChecklistItem() {
    const trimmed = newChecklistItem.trim();
    if (!trimmed) return;
    setChecklistItems((prev) => [...prev, trimmed]);
    setNewChecklistItem('');
  }

  function handleChecklistKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddChecklistItem();
    }
  }

  function handleRemoveChecklistItem(index: number) {
    setChecklistItems((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const taskInput: CreateTaskInput = {
      title: fields.title,
      description: fields.description.trim() || undefined,
      status: fields.status,
      priority: fields.priority,
    };
    if (fields.dueDate) taskInput.dueDate = fields.dueDate;
    onSubmit({ taskInput, checklistTitles: checklistItems });
  }

  const canSubmit = fields.title.trim().length > 0 && !isSubmitting;

  const inputClass =
    'rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400';
  const labelClass = 'text-sm font-medium text-gray-700 dark:text-gray-300';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="convert-title" className={labelClass}>
          Title <span className="text-red-500">*</span>
        </label>
        <input
          ref={titleRef}
          id="convert-title"
          name="title"
          type="text"
          required
          value={fields.title}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="convert-description" className={labelClass}>
          Description
        </label>
        <textarea
          id="convert-description"
          name="description"
          rows={3}
          value={fields.description}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="convert-status" className={labelClass}>
          Status
        </label>
        <select
          id="convert-status"
          name="status"
          value={fields.status}
          onChange={handleChange}
          className={inputClass}
        >
          <option value="todo">Todo</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="convert-priority" className={labelClass}>
          Priority
        </label>
        <select
          id="convert-priority"
          name="priority"
          value={fields.priority}
          onChange={handleChange}
          className={inputClass}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <DatePicker
          id="convert-dueDate"
          label="Due Date"
          value={fields.dueDate || undefined}
          onChange={(date) =>
            setFields((prev) => ({ ...prev, dueDate: date ?? '' }))
          }
        />
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setShowChecklist(!showChecklist)}
          className="self-start text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          {showChecklist ? 'Hide checklist' : 'Add checklist'}
        </button>

        {showChecklist && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={newChecklistItem}
                onChange={(e) => setNewChecklistItem(e.target.value)}
                onKeyDown={handleChecklistKeyDown}
                placeholder="Checklist item..."
                aria-label="New checklist item"
                className={inputClass + ' flex-1'}
              />
              <button
                type="button"
                onClick={handleAddChecklistItem}
                disabled={!newChecklistItem.trim()}
                className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                aria-label="Add checklist item"
              >
                Add
              </button>
            </div>
            {checklistItems.length > 0 && (
              <ul className="space-y-1" aria-label="Checklist items">
                {checklistItems.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-1.5 text-sm dark:bg-gray-700"
                  >
                    <span className="text-gray-700 dark:text-gray-300">
                      {item}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveChecklistItem(index)}
                      className="text-xs text-red-500 hover:text-red-700 dark:text-red-400"
                      aria-label={`Remove ${item}`}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? 'Converting...' : 'Convert to Task'}
        </button>
      </div>
    </form>
  );
}
