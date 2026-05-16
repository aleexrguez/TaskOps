import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { InboxQuickInput } from '../InboxQuickInput';

describe('InboxQuickInput', () => {
  it('calls onSubmit with title on Enter', async () => {
    const onSubmit = vi.fn();
    render(<InboxQuickInput onSubmit={onSubmit} />);

    const input = screen.getByLabelText('Inbox item title');
    await userEvent.type(input, 'My idea{enter}');

    expect(onSubmit).toHaveBeenCalledWith({ title: 'My idea' });
  });

  it('does not submit empty title', async () => {
    const onSubmit = vi.fn();
    render(<InboxQuickInput onSubmit={onSubmit} />);

    const input = screen.getByLabelText('Inbox item title');
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('does not submit whitespace-only title', async () => {
    const onSubmit = vi.fn();
    render(<InboxQuickInput onSubmit={onSubmit} />);

    const input = screen.getByLabelText('Inbox item title');
    await userEvent.type(input, '   {enter}');

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('clears input after submit', async () => {
    const onSubmit = vi.fn();
    render(<InboxQuickInput onSubmit={onSubmit} />);

    const input = screen.getByLabelText('Inbox item title');
    await userEvent.type(input, 'Test{enter}');

    expect(input).toHaveValue('');
  });

  it('toggles notes textarea', async () => {
    const onSubmit = vi.fn();
    render(<InboxQuickInput onSubmit={onSubmit} />);

    expect(screen.queryByLabelText('Inbox item notes')).not.toBeInTheDocument();

    await userEvent.click(screen.getByLabelText('Add notes'));
    expect(screen.getByLabelText('Inbox item notes')).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText('Hide notes'));
    expect(screen.queryByLabelText('Inbox item notes')).not.toBeInTheDocument();
  });

  it('includes notes in onSubmit when provided', async () => {
    const onSubmit = vi.fn();
    render(<InboxQuickInput onSubmit={onSubmit} />);

    await userEvent.click(screen.getByLabelText('Add notes'));

    const titleInput = screen.getByLabelText('Inbox item title');
    const notesInput = screen.getByLabelText('Inbox item notes');

    await userEvent.type(titleInput, 'Idea');
    await userEvent.type(notesInput, 'Details here');
    await userEvent.click(screen.getByLabelText('Add inbox item'));

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Idea',
      notes: 'Details here',
    });
  });

  it('disables submit button when isSubmitting', () => {
    const onSubmit = vi.fn();
    render(<InboxQuickInput onSubmit={onSubmit} isSubmitting />);

    expect(screen.getByLabelText('Add inbox item')).toBeDisabled();
  });
});
