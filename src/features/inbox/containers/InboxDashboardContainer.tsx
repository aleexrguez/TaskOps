import {
  useInboxItems,
  useCreateInboxItem,
  useUpdateInboxItem,
  useDeleteInboxItem,
  useConvertInboxItem,
} from '../hooks/use-inbox';
import { useInboxUIStore } from '../store/inbox-ui.store';
import { useToastStore } from '@/shared/store/toast.store';
import {
  InboxPage,
  InboxQuickInput,
  InboxItemCard,
  InboxItemEditForm,
  InboxEmptyState,
} from '../components';
import { ConvertToTaskContainer } from './ConvertToTaskContainer';

export function InboxDashboardContainer() {
  const { data, isLoading, isError } = useInboxItems();
  const items = data?.items ?? [];
  const createMutation = useCreateInboxItem();
  const updateMutation = useUpdateInboxItem();
  const deleteMutation = useDeleteInboxItem();
  const convertMutation = useConvertInboxItem();

  const editingItemId = useInboxUIStore((s) => s.editingItemId);
  const setEditingItem = useInboxUIStore((s) => s.setEditingItem);
  const convertingItemId = useInboxUIStore((s) => s.convertingItemId);
  const setConvertingItem = useInboxUIStore((s) => s.setConvertingItem);
  const addToast = useToastStore((s) => s.addToast);

  function handleCreate(input: { title: string; notes?: string }) {
    createMutation.mutate(
      { title: input.title, notes: input.notes ?? null },
      {
        onSuccess: () => addToast('Idea captured', 'success'),
        onError: () => addToast('Failed to capture idea', 'error'),
      },
    );
  }

  function handleUpdate(
    id: string,
    data: { title: string; notes: string | null },
  ) {
    updateMutation.mutate(
      { id, input: { title: data.title, notes: data.notes } },
      {
        onSuccess: () => {
          setEditingItem(null);
          addToast('Item updated', 'success');
        },
        onError: () => addToast('Failed to update item', 'error'),
      },
    );
  }

  function handleDelete(id: string) {
    deleteMutation.mutate(id, {
      onSuccess: () => addToast('Item deleted', 'success'),
      onError: () => addToast('Failed to delete item', 'error'),
    });
  }

  function handleConvert(id: string) {
    setConvertingItem(id);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-red-600 dark:text-red-400">
          Failed to load inbox items
        </p>
      </div>
    );
  }

  const convertingItem = items.find((i) => i.id === convertingItemId) ?? null;

  return (
    <>
      <InboxPage
        itemCount={items.length}
        quickInput={
          <InboxQuickInput
            onSubmit={handleCreate}
            isSubmitting={createMutation.isPending}
          />
        }
      >
        {items.length === 0 ? (
          <InboxEmptyState />
        ) : (
          items.map((item) =>
            editingItemId === item.id ? (
              <InboxItemEditForm
                key={item.id}
                initialTitle={item.title}
                initialNotes={item.notes}
                onSave={(data) => handleUpdate(item.id, data)}
                onCancel={() => setEditingItem(null)}
                isSubmitting={updateMutation.isPending}
              />
            ) : (
              <InboxItemCard
                key={item.id}
                item={item}
                onEdit={setEditingItem}
                onConvert={handleConvert}
                onDelete={handleDelete}
                disabled={deleteMutation.isPending || convertMutation.isPending}
              />
            ),
          )
        )}
      </InboxPage>

      {convertingItem && <ConvertToTaskContainer item={convertingItem} />}
    </>
  );
}
