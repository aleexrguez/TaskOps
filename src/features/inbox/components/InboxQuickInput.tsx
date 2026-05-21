import { useEffect, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';

interface InboxQuickInputProps {
  onSubmit: (input: { title: string; notes?: string }) => void;
  isSubmitting?: boolean;
}

export function InboxQuickInput({
  onSubmit,
  isSubmitting = false,
}: InboxQuickInputProps) {
  const { t } = useTranslation('inbox');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const canSubmit = title.trim().length > 0 && !isSubmitting;

  function handleSubmit(e?: FormEvent) {
    e?.preventDefault();
    if (!canSubmit) return;

    onSubmit({ title: title.trim(), notes: notes.trim() || undefined });
    setTitle('');
    setNotes('');
    setShowNotes(false);
    titleRef.current?.focus();
  }

  function handleTitleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <input
          ref={titleRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleTitleKeyDown}
          placeholder={t('quickInput.placeholder')}
          aria-label={t('quickInput.titleLabel')}
          className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-indigo-400"
        />
        <button
          type="button"
          onClick={() => setShowNotes(!showNotes)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
          aria-label={
            showNotes ? t('quickInput.hideNotes') : t('quickInput.addNotes')
          }
          title={
            showNotes ? t('quickInput.hideNotes') : t('quickInput.addNotes')
          }
        >
          {showNotes ? '−' : '+'}
        </button>
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          aria-label={t('quickInput.addItem')}
        >
          {isSubmitting ? '...' : t('common:action.add')}
        </button>
      </div>

      {showNotes && (
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t('quickInput.notesPlaceholder')}
          aria-label={t('quickInput.notesLabel')}
          rows={2}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-indigo-400"
        />
      )}
    </form>
  );
}
