import type { InboxItem } from '../types/inbox.types';

interface InboxItemCardProps {
  item: InboxItem;
  onEdit: (id: string) => void;
  onConvert: (id: string) => void;
  onDelete: (id: string) => void;
  disabled?: boolean;
}

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function InboxItemCard({
  item,
  onEdit,
  onConvert,
  onDelete,
  disabled = false,
}: InboxItemCardProps) {
  return (
    <div
      data-testid={`inbox-item-${item.id}`}
      className="group rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-indigo-700"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {item.title}
          </h3>
          {item.notes && (
            <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
              {item.notes}
            </p>
          )}
          <span className="mt-2 block text-xs text-gray-400 dark:text-gray-500">
            {relativeTime(item.createdAt)}
          </span>
        </div>

        <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <button
            type="button"
            onClick={() => onEdit(item.id)}
            disabled={disabled}
            className="rounded-md px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700"
            aria-label={`Edit ${item.title}`}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onConvert(item.id)}
            disabled={disabled}
            className="rounded-md px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-indigo-400 dark:hover:bg-indigo-900/40"
            aria-label={`Convert ${item.title} to task`}
          >
            Convert
          </button>
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            disabled={disabled}
            className="rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/40"
            aria-label={`Delete ${item.title}`}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
