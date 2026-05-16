import { useEffect, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';

interface InboxItemEditFormProps {
  initialTitle: string;
  initialNotes: string | null;
  onSave: (data: { title: string; notes: string | null }) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function InboxItemEditForm({
  initialTitle,
  initialNotes,
  onSave,
  onCancel,
  isSubmitting = false,
}: InboxItemEditFormProps) {
  const titleRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(initialTitle);
  const [notes, setNotes] = useState(initialNotes ?? '');

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const canSave = title.trim().length > 0 && !isSubmitting;

  function handleSubmit(e?: FormEvent) {
    e?.preventDefault();
    if (!canSave) return;
    onSave({
      title: title.trim(),
      notes: notes.trim() || null,
    });
  }

  function handleTitleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') {
      onCancel();
    }
  }

  function handleNotesKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Escape') {
      onCancel();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-2 rounded-lg border border-indigo-200 bg-white p-4 shadow-sm dark:border-indigo-700 dark:bg-gray-800"
    >
      <input
        ref={titleRef}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleTitleKeyDown}
        aria-label="Edit title"
        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
      />
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onKeyDown={handleNotesKeyDown}
        placeholder="Notes (optional)"
        aria-label="Edit notes"
        rows={2}
        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
      />
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!canSave}
          className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
}
