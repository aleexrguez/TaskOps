import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConvertInboxItem } from '../hooks/use-inbox';
import { useInboxUIStore } from '../store/inbox-ui.store';
import { useToastStore } from '@/shared/store/toast.store';
import { ConvertToTaskForm } from '../components/ConvertToTaskForm';
import type { ConvertToTaskFormData } from '../components/ConvertToTaskForm';
import type { InboxItem } from '../types/inbox.types';
import { useScrollLock } from '@/shared/hooks/use-scroll-lock';

interface ConvertToTaskContainerProps {
  item: InboxItem;
}

export function ConvertToTaskContainer({ item }: ConvertToTaskContainerProps) {
  const { t } = useTranslation(['inbox', 'common']);
  const setConvertingItem = useInboxUIStore((s) => s.setConvertingItem);
  const addToast = useToastStore((s) => s.addToast);
  const { mutate: convert, isPending } = useConvertInboxItem();
  useScrollLock(true);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setConvertingItem(null);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setConvertingItem]);

  function handleSubmit({ taskInput, checklistTitles }: ConvertToTaskFormData) {
    convert(
      {
        inboxItemId: item.id,
        taskInput,
        checklistTitles:
          checklistTitles.length > 0 ? checklistTitles : undefined,
      },
      {
        onSuccess: () => {
          addToast(t('inbox:toast.converted'), 'success');
          setConvertingItem(null);
        },
        onError: () => {
          addToast(t('inbox:toast.convertFailed'), 'error');
        },
      },
    );
  }

  function handleCancel() {
    setConvertingItem(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="convert-task-title"
        className="mx-4 flex w-full max-w-md flex-col rounded-lg bg-white shadow-xl md:mx-auto dark:bg-gray-800 max-h-[calc(100vh-2rem)]"
      >
        <div className="overflow-y-auto overscroll-contain p-4 md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2
              id="convert-task-title"
              className="text-lg font-semibold text-gray-900 dark:text-gray-100"
            >
              {t('inbox:convertForm.dialogTitle')}
            </h2>
            <button
              type="button"
              aria-label={t('common:action.close')}
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>
          <ConvertToTaskForm
            initialTitle={item.title}
            initialDescription={item.notes ?? ''}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isPending}
          />
        </div>
      </div>
    </div>
  );
}
