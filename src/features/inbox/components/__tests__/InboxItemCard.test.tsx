import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { InboxItemCard } from '../InboxItemCard';
import type { InboxItem } from '../../types/inbox.types';

const mockItem: InboxItem = {
  id: 'item-1',
  title: 'Quick idea',
  notes: 'Some notes about this idea that could be quite long',
  createdAt: new Date().toISOString(),
  convertedTaskId: null,
  convertedAt: null,
};

describe('InboxItemCard', () => {
  it('renders title and notes', () => {
    render(
      <InboxItemCard
        item={mockItem}
        onEdit={vi.fn()}
        onConvert={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText('Quick idea')).toBeInTheDocument();
    expect(screen.getByText(/Some notes about/)).toBeInTheDocument();
  });

  it('does not render notes when null', () => {
    const itemNoNotes = { ...mockItem, notes: null };
    render(
      <InboxItemCard
        item={itemNoNotes}
        onEdit={vi.fn()}
        onConvert={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText('Quick idea')).toBeInTheDocument();
    expect(screen.queryByText(/Some notes/)).not.toBeInTheDocument();
  });

  it('calls onEdit with id', async () => {
    const onEdit = vi.fn();
    render(
      <InboxItemCard
        item={mockItem}
        onEdit={onEdit}
        onConvert={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByLabelText(`Edit ${mockItem.title}`));
    expect(onEdit).toHaveBeenCalledWith('item-1');
  });

  it('calls onConvert with id', async () => {
    const onConvert = vi.fn();
    render(
      <InboxItemCard
        item={mockItem}
        onEdit={vi.fn()}
        onConvert={onConvert}
        onDelete={vi.fn()}
      />,
    );

    await userEvent.click(
      screen.getByLabelText(`Convert ${mockItem.title} to task`),
    );
    expect(onConvert).toHaveBeenCalledWith('item-1');
  });

  it('calls onDelete with id', async () => {
    const onDelete = vi.fn();
    render(
      <InboxItemCard
        item={mockItem}
        onEdit={vi.fn()}
        onConvert={vi.fn()}
        onDelete={onDelete}
      />,
    );

    await userEvent.click(screen.getByLabelText(`Delete ${mockItem.title}`));
    expect(onDelete).toHaveBeenCalledWith('item-1');
  });

  it('disables all action buttons when disabled', () => {
    render(
      <InboxItemCard
        item={mockItem}
        onEdit={vi.fn()}
        onConvert={vi.fn()}
        onDelete={vi.fn()}
        disabled
      />,
    );

    expect(screen.getByLabelText(`Edit ${mockItem.title}`)).toBeDisabled();
    expect(
      screen.getByLabelText(`Convert ${mockItem.title} to task`),
    ).toBeDisabled();
    expect(screen.getByLabelText(`Delete ${mockItem.title}`)).toBeDisabled();
  });
});
