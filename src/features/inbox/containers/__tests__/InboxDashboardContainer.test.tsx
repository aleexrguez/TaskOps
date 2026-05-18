import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { InboxDashboardContainer } from '../InboxDashboardContainer';
import { useInboxUIStore } from '../../store/inbox-ui.store';
import { useToastStore } from '@/shared/store/toast.store';
import type { InboxItem } from '../../types/inbox.types';

vi.mock('../../api', () => ({
  fetchInboxItems: vi.fn(),
  createInboxItem: vi.fn(),
  updateInboxItem: vi.fn(),
  deleteInboxItem: vi.fn(),
  convertInboxItemToTask: vi.fn(),
}));

vi.mock('@/features/auth/hooks', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'test-user', email: 'testuser@example.com' },
    session: null,
    isLoading: false,
  })),
}));

vi.mock('@/features/account/hooks/use-profile', () => ({
  useProfile: vi.fn(() => ({ data: null })),
}));

import {
  fetchInboxItems,
  createInboxItem,
  updateInboxItem,
  deleteInboxItem,
  convertInboxItemToTask,
} from '../../api';
import { useProfile } from '@/features/account/hooks/use-profile';
import { useAuth } from '@/features/auth/hooks';

function makeItem(overrides: Partial<InboxItem> = {}): InboxItem {
  return {
    id: crypto.randomUUID(),
    title: 'Test idea',
    notes: null,
    createdAt: '2026-05-16T10:00:00.000Z',
    convertedTaskId: null,
    convertedAt: null,
    ...overrides,
  };
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe('InboxDashboardContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useInboxUIStore.getState().reset();
    useToastStore.setState({ toasts: [] });
  });

  it('shows loading state', () => {
    (fetchInboxItems as ReturnType<typeof vi.fn>).mockReturnValue(
      new Promise(() => {}),
    );
    render(<InboxDashboardContainer />, { wrapper: createWrapper() });

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows error state', async () => {
    (fetchInboxItems as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('fail'),
    );
    render(<InboxDashboardContainer />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(
        screen.getByText('Failed to load inbox items'),
      ).toBeInTheDocument();
    });
  });

  it('shows empty state when no items', async () => {
    (fetchInboxItems as ReturnType<typeof vi.fn>).mockResolvedValue({
      items: [],
      total: 0,
    });
    render(<InboxDashboardContainer />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Your inbox is empty')).toBeInTheDocument();
    });
  });

  it('renders items when data is available', async () => {
    const items = [
      makeItem({ id: 'item-1', title: 'First idea' }),
      makeItem({ id: 'item-2', title: 'Second idea' }),
    ];
    (fetchInboxItems as ReturnType<typeof vi.fn>).mockResolvedValue({
      items,
      total: items.length,
    });
    render(<InboxDashboardContainer />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('First idea')).toBeInTheDocument();
    });
    expect(screen.getByText('Second idea')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // badge count
  });

  it('creates an item and shows success toast', async () => {
    const user = userEvent.setup();
    (fetchInboxItems as ReturnType<typeof vi.fn>).mockResolvedValue({
      items: [],
      total: 0,
    });
    (createInboxItem as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeItem({ title: 'New idea' }),
    );

    render(<InboxDashboardContainer />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Your inbox is empty')).toBeInTheDocument();
    });

    const input = screen.getByLabelText('Inbox item title');
    await user.type(input, 'New idea');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(createInboxItem).toHaveBeenCalledWith({
        title: 'New idea',
        notes: null,
      });
    });
    expect(useToastStore.getState().toasts).toContainEqual(
      expect.objectContaining({ message: 'Idea captured', type: 'success' }),
    );
  });

  it('shows error toast on create failure', async () => {
    const user = userEvent.setup();
    (fetchInboxItems as ReturnType<typeof vi.fn>).mockResolvedValue({
      items: [],
      total: 0,
    });
    (createInboxItem as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('fail'),
    );

    render(<InboxDashboardContainer />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Your inbox is empty')).toBeInTheDocument();
    });

    const input = screen.getByLabelText('Inbox item title');
    await user.type(input, 'Failing idea');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(useToastStore.getState().toasts).toContainEqual(
        expect.objectContaining({
          message: 'Failed to capture idea',
          type: 'error',
        }),
      );
    });
  });

  it('switches to edit form when Edit is clicked', async () => {
    const user = userEvent.setup();
    const items = [makeItem({ id: 'item-1', title: 'Editable idea' })];
    (fetchInboxItems as ReturnType<typeof vi.fn>).mockResolvedValue({
      items,
      total: items.length,
    });

    render(<InboxDashboardContainer />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Editable idea')).toBeInTheDocument();
    });

    await user.click(screen.getByLabelText('Edit Editable idea'));
    expect(screen.getByLabelText('Edit title')).toHaveValue('Editable idea');
  });

  it('updates an item and shows success toast', async () => {
    const user = userEvent.setup();
    const items = [makeItem({ id: 'item-1', title: 'Old title' })];
    (fetchInboxItems as ReturnType<typeof vi.fn>).mockResolvedValue({
      items,
      total: items.length,
    });
    (updateInboxItem as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeItem({ id: 'item-1', title: 'New title' }),
    );

    render(<InboxDashboardContainer />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Old title')).toBeInTheDocument();
    });

    await user.click(screen.getByLabelText('Edit Old title'));
    const titleInput = screen.getByLabelText('Edit title');
    await user.clear(titleInput);
    await user.type(titleInput, 'New title');
    await user.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(updateInboxItem).toHaveBeenCalledWith('item-1', {
        title: 'New title',
        notes: null,
      });
    });
    expect(useToastStore.getState().toasts).toContainEqual(
      expect.objectContaining({ message: 'Item updated', type: 'success' }),
    );
  });

  it('deletes an item and shows success toast', async () => {
    const user = userEvent.setup();
    const items = [makeItem({ id: 'item-1', title: 'Delete me' })];
    (fetchInboxItems as ReturnType<typeof vi.fn>).mockResolvedValue({
      items,
      total: items.length,
    });
    (deleteInboxItem as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    render(<InboxDashboardContainer />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Delete me')).toBeInTheDocument();
    });

    await user.click(screen.getByLabelText('Delete Delete me'));

    await waitFor(() => {
      expect(deleteInboxItem).toHaveBeenCalledWith('item-1');
    });
    expect(useToastStore.getState().toasts).toContainEqual(
      expect.objectContaining({ message: 'Item deleted', type: 'success' }),
    );
  });

  it('opens convert modal when Convert is clicked', async () => {
    const user = userEvent.setup();
    const items = [
      makeItem({ id: 'item-1', title: 'Convert me', notes: 'Some notes' }),
    ];
    (fetchInboxItems as ReturnType<typeof vi.fn>).mockResolvedValue({
      items,
      total: items.length,
    });

    render(<InboxDashboardContainer />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Convert me')).toBeInTheDocument();
    });

    await user.click(screen.getByLabelText('Convert Convert me to task'));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Convert to Task' }),
    ).toBeInTheDocument();
    // Pre-filled values
    expect(screen.getByLabelText(/Title/)).toHaveValue('Convert me');
    expect(screen.getByLabelText(/Description/)).toHaveValue('Some notes');
  });

  it('converts item and shows success toast on submit', async () => {
    const user = userEvent.setup();
    const items = [makeItem({ id: 'item-1', title: 'Convert me' })];
    (fetchInboxItems as ReturnType<typeof vi.fn>).mockResolvedValue({
      items,
      total: items.length,
    });
    (convertInboxItemToTask as ReturnType<typeof vi.fn>).mockResolvedValue({
      inboxItem: makeItem({
        id: 'item-1',
        convertedAt: '2026-05-16T12:00:00Z',
      }),
      task: { id: 'task-1', title: 'Convert me' },
    });

    render(<InboxDashboardContainer />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Convert me')).toBeInTheDocument();
    });

    await user.click(screen.getByLabelText('Convert Convert me to task'));
    await user.click(screen.getByRole('button', { name: 'Convert to Task' }));

    await waitFor(() => {
      expect(convertInboxItemToTask).toHaveBeenCalledWith(
        'item-1',
        expect.objectContaining({ title: 'Convert me', status: 'todo' }),
        undefined,
      );
    });
    expect(useToastStore.getState().toasts).toContainEqual(
      expect.objectContaining({
        message: 'Idea converted to task',
        type: 'success',
      }),
    );
    // Modal should be closed
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows error toast and keeps modal open on conversion failure', async () => {
    const user = userEvent.setup();
    const items = [makeItem({ id: 'item-1', title: 'Fail convert' })];
    (fetchInboxItems as ReturnType<typeof vi.fn>).mockResolvedValue({
      items,
      total: items.length,
    });
    (convertInboxItemToTask as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Already converted'),
    );

    render(<InboxDashboardContainer />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Fail convert')).toBeInTheDocument();
    });

    await user.click(screen.getByLabelText('Convert Fail convert to task'));
    await user.click(screen.getByRole('button', { name: 'Convert to Task' }));

    await waitFor(() => {
      expect(useToastStore.getState().toasts).toContainEqual(
        expect.objectContaining({
          message: 'Failed to convert idea',
          type: 'error',
        }),
      );
    });
    // Modal stays open
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  describe('hero greeting', () => {
    beforeEach(() => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      vi.setSystemTime(new Date('2026-05-18T09:00:00'));
      (fetchInboxItems as ReturnType<typeof vi.fn>).mockResolvedValue({
        items: [],
        total: 0,
      });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('shows first word of display_name in hero', async () => {
      (useProfile as ReturnType<typeof vi.fn>).mockReturnValue({
        data: { display_name: 'Alessandro Rodriguez' },
      });

      render(<InboxDashboardContainer />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(
          screen.getByText('Good morning, Alessandro'),
        ).toBeInTheDocument();
      });
    });

    it('shows email username when display_name is null', async () => {
      (useProfile as ReturnType<typeof vi.fn>).mockReturnValue({
        data: { display_name: null },
      });

      render(<InboxDashboardContainer />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Good morning, testuser')).toBeInTheDocument();
      });
    });

    it('shows "there" when both profile and email are absent', async () => {
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
        user: null,
        session: null,
        isLoading: false,
      });
      (useProfile as ReturnType<typeof vi.fn>).mockReturnValue({
        data: null,
      });

      render(<InboxDashboardContainer />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Good morning, there')).toBeInTheDocument();
      });
    });

    it('renders the hero subtitle', async () => {
      (useProfile as ReturnType<typeof vi.fn>).mockReturnValue({
        data: { display_name: 'Alex' },
      });

      render(<InboxDashboardContainer />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(
          screen.getByText('What do you want to capture today?'),
        ).toBeInTheDocument();
      });
    });
  });
});
