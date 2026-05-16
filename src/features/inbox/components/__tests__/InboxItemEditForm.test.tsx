import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { InboxItemEditForm } from '../InboxItemEditForm';

describe('InboxItemEditForm', () => {
  it('pre-fills title and notes', () => {
    render(
      <InboxItemEditForm
        initialTitle="Original"
        initialNotes="Original notes"
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByLabelText('Edit title')).toHaveValue('Original');
    expect(screen.getByLabelText('Edit notes')).toHaveValue('Original notes');
  });

  it('pre-fills empty notes when null', () => {
    render(
      <InboxItemEditForm
        initialTitle="Test"
        initialNotes={null}
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByLabelText('Edit notes')).toHaveValue('');
  });

  it('calls onSave with updated values', async () => {
    const onSave = vi.fn();
    render(
      <InboxItemEditForm
        initialTitle="Old"
        initialNotes={null}
        onSave={onSave}
        onCancel={vi.fn()}
      />,
    );

    const titleInput = screen.getByLabelText('Edit title');
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'New title');
    await userEvent.click(screen.getByText('Save'));

    expect(onSave).toHaveBeenCalledWith({
      title: 'New title',
      notes: null,
    });
  });

  it('does not save with empty title', async () => {
    const onSave = vi.fn();
    render(
      <InboxItemEditForm
        initialTitle="Test"
        initialNotes={null}
        onSave={onSave}
        onCancel={vi.fn()}
      />,
    );

    const titleInput = screen.getByLabelText('Edit title');
    await userEvent.clear(titleInput);
    await userEvent.click(screen.getByText('Save'));

    expect(onSave).not.toHaveBeenCalled();
  });

  it('calls onCancel when Cancel is clicked', async () => {
    const onCancel = vi.fn();
    render(
      <InboxItemEditForm
        initialTitle="Test"
        initialNotes={null}
        onSave={vi.fn()}
        onCancel={onCancel}
      />,
    );

    await userEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalled();
  });

  it('disables Save button when isSubmitting', () => {
    render(
      <InboxItemEditForm
        initialTitle="Test"
        initialNotes={null}
        onSave={vi.fn()}
        onCancel={vi.fn()}
        isSubmitting
      />,
    );

    expect(screen.getByText('Saving...')).toBeDisabled();
  });
});
