import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';

interface DraftChecklistInputProps {
  items: string[];
  onAdd: (title: string) => void;
  onRemove: (index: number) => void;
}

export function DraftChecklistInput({
  items,
  onAdd,
  onRemove,
}: DraftChecklistInputProps) {
  const { t } = useTranslation('task');
  const [showChecklist, setShowChecklist] = useState(false);
  const [newItemValue, setNewItemValue] = useState('');

  function handleAdd() {
    const trimmed = newItemValue.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setNewItemValue('');
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  }

  const inputClass =
    'rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400';

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setShowChecklist(!showChecklist)}
        className="self-start text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
      >
        {showChecklist
          ? t('draftChecklist.hideChecklist')
          : t('draftChecklist.addChecklist')}
      </button>

      {showChecklist && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={newItemValue}
              onChange={(e) => setNewItemValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('draftChecklist.placeholder')}
              aria-label={t('draftChecklist.inputLabel')}
              className={inputClass + ' flex-1'}
            />
            <button
              type="button"
              onClick={handleAdd}
              disabled={!newItemValue.trim()}
              className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              aria-label={t('draftChecklist.addItem')}
            >
              {t('common:action.add')}
            </button>
          </div>
          {items.length > 0 && (
            <ul className="space-y-1" aria-label={t('draftChecklist.items')}>
              {items.map((item, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-1.5 text-sm dark:bg-gray-700"
                >
                  <span className="text-gray-700 dark:text-gray-300">
                    {item}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="text-xs text-red-500 hover:text-red-700 dark:text-red-400"
                    aria-label={t('draftChecklist.removeItem', { item })}
                  >
                    {t('common:action.remove')}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
