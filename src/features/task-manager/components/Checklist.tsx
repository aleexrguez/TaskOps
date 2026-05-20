import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  ChecklistItem,
  ReorderChecklistItem,
} from '../types/checklist.types';
import { ChecklistProgress } from './ChecklistProgress';

interface ChecklistProps {
  items: ChecklistItem[];
  onToggle: (id: string, isCompleted: boolean) => void;
  onCreate: (title: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, title: string) => void;
  onReorder: (items: ReorderChecklistItem[]) => void;
  isLoading?: boolean;
}

export function Checklist({
  items,
  onToggle,
  onCreate,
  onDelete,
  onUpdate,
  onReorder,
  isLoading = false,
}: ChecklistProps) {
  const { t } = useTranslation('task');
  const [newItemTitle, setNewItemTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const cancelledRef = useRef(false);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  function startEdit(item: ChecklistItem) {
    cancelledRef.current = false;
    setEditingId(item.id);
    setEditingTitle(item.title);
  }

  function saveEdit() {
    const trimmed = editingTitle.trim();
    if (trimmed && editingId) {
      onUpdate(editingId, trimmed);
    }
    setEditingId(null);
    setEditingTitle('');
  }

  function cancelEdit() {
    cancelledRef.current = true;
    setEditingId(null);
    setEditingTitle('');
  }

  function handleEditKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdit();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
  }

  function handleEditBlur() {
    if (cancelledRef.current) {
      cancelledRef.current = false;
      return;
    }
    saveEdit();
  }

  function handleMoveUp(index: number) {
    if (index === 0) return;
    const reordered = [...items];
    [reordered[index - 1], reordered[index]] = [
      reordered[index],
      reordered[index - 1],
    ];
    onReorder(reordered.map((item, i) => ({ id: item.id, position: i })));
  }

  function handleMoveDown(index: number) {
    if (index === items.length - 1) return;
    const reordered = [...items];
    [reordered[index], reordered[index + 1]] = [
      reordered[index + 1],
      reordered[index],
    ];
    onReorder(reordered.map((item, i) => ({ id: item.id, position: i })));
  }

  function handleCreateKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = newItemTitle.trim();
      if (!trimmed) return;
      onCreate(trimmed);
      setNewItemTitle('');
    }
  }

  const completedCount = items.filter((i) => i.isCompleted).length;

  return (
    <section aria-label={t('checklist.heading')}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {t('checklist.heading')}
        </h3>
        <ChecklistProgress completed={completedCount} total={items.length} />
      </div>

      {isLoading ? (
        <div className="space-y-2" data-testid="checklist-skeleton">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
            />
          ))}
        </div>
      ) : (
        <ul className="space-y-1">
          {items.map((item, index) => (
            <li
              key={item.id}
              className="group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <input
                type="checkbox"
                checked={item.isCompleted}
                onChange={() => onToggle(item.id, !item.isCompleted)}
                aria-label={
                  item.isCompleted
                    ? t('checklist.markIncomplete', { title: item.title })
                    : t('checklist.markComplete', { title: item.title })
                }
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />

              {editingId === item.id ? (
                <input
                  ref={editInputRef}
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onKeyDown={handleEditKeyDown}
                  onBlur={handleEditBlur}
                  className="flex-1 rounded border border-gray-300 px-2 py-0.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  aria-label={t('checklist.editTitle')}
                />
              ) : (
                <span
                  onClick={() => startEdit(item)}
                  className={`flex-1 cursor-pointer text-sm ${
                    item.isCompleted
                      ? 'text-gray-400 line-through dark:text-gray-500'
                      : 'text-gray-700 dark:text-gray-200'
                  }`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') startEdit(item);
                  }}
                >
                  {item.title}
                </span>
              )}

              <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                <button
                  type="button"
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  aria-label={t('checklist.moveUp', { title: item.title })}
                  className="rounded p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus-visible:opacity-100 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:text-gray-300"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveDown(index)}
                  disabled={index === items.length - 1}
                  aria-label={t('checklist.moveDown', { title: item.title })}
                  className="rounded p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus-visible:opacity-100 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:text-gray-300"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(item.id)}
                  aria-label={t('checklist.deleteItem', { title: item.title })}
                  className="rounded p-1 text-gray-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus-visible:opacity-100 dark:hover:text-red-400"
                >
                  ×
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-2">
        <input
          type="text"
          value={newItemTitle}
          onChange={(e) => setNewItemTitle(e.target.value)}
          onKeyDown={handleCreateKeyDown}
          placeholder={t('checklist.addPlaceholder')}
          aria-label={t('checklist.addItem')}
          className="w-full rounded-md border border-dashed border-gray-300 px-3 py-1.5 text-sm placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-100 dark:placeholder-gray-500"
        />
      </div>
    </section>
  );
}
