import type { ReactNode } from 'react';

interface InboxPageProps {
  itemCount: number;
  quickInput: ReactNode;
  children: ReactNode;
}

export function InboxPage({ itemCount, quickInput, children }: InboxPageProps) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Inbox
        </h1>
        {itemCount > 0 && (
          <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
            {itemCount}
          </span>
        )}
      </div>

      <div className="mb-6">{quickInput}</div>

      <div className="space-y-3">{children}</div>
    </div>
  );
}
