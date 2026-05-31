import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DraftChecklistInput } from '../DraftChecklistInput';

describe('DraftChecklistInput', () => {
  it('renders toggle button with "Add checklist" text', () => {
    render(
      <DraftChecklistInput items={[]} onAdd={vi.fn()} onRemove={vi.fn()} />,
    );
    expect(screen.getByText('Add checklist')).toBeInTheDocument();
  });

  it('does not show input or list when collapsed', () => {
    render(
      <DraftChecklistInput items={[]} onAdd={vi.fn()} onRemove={vi.fn()} />,
    );
    expect(
      screen.queryByLabelText(/new checklist item/i),
    ).not.toBeInTheDocument();
  });

  it('shows input and add button when toggled open', async () => {
    const user = userEvent.setup();
    render(
      <DraftChecklistInput items={[]} onAdd={vi.fn()} onRemove={vi.fn()} />,
    );

    await user.click(screen.getByText('Add checklist'));

    expect(screen.getByLabelText(/new checklist item/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/add checklist item/i)).toBeInTheDocument();
    expect(screen.getByText('Hide checklist')).toBeInTheDocument();
  });

  it('adds item on Enter key', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<DraftChecklistInput items={[]} onAdd={onAdd} onRemove={vi.fn()} />);

    await user.click(screen.getByText('Add checklist'));
    await user.type(
      screen.getByLabelText(/new checklist item/i),
      'Buy milk{Enter}',
    );

    expect(onAdd).toHaveBeenCalledWith('Buy milk');
  });

  it('adds item on button click', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<DraftChecklistInput items={[]} onAdd={onAdd} onRemove={vi.fn()} />);

    await user.click(screen.getByText('Add checklist'));
    await user.type(screen.getByLabelText(/new checklist item/i), 'Buy eggs');
    await user.click(screen.getByLabelText(/add checklist item/i));

    expect(onAdd).toHaveBeenCalledWith('Buy eggs');
  });

  it('trims whitespace from input', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<DraftChecklistInput items={[]} onAdd={onAdd} onRemove={vi.fn()} />);

    await user.click(screen.getByText('Add checklist'));
    await user.type(
      screen.getByLabelText(/new checklist item/i),
      '  Buy bread  {Enter}',
    );

    expect(onAdd).toHaveBeenCalledWith('Buy bread');
  });

  it('does not add empty input on Enter', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<DraftChecklistInput items={[]} onAdd={onAdd} onRemove={vi.fn()} />);

    await user.click(screen.getByText('Add checklist'));
    await user.type(screen.getByLabelText(/new checklist item/i), '{Enter}');

    expect(onAdd).not.toHaveBeenCalled();
  });

  it('disables add button when input is empty', async () => {
    const user = userEvent.setup();
    render(
      <DraftChecklistInput items={[]} onAdd={vi.fn()} onRemove={vi.fn()} />,
    );

    await user.click(screen.getByText('Add checklist'));

    expect(screen.getByLabelText(/add checklist item/i)).toBeDisabled();
  });

  it('does not add whitespace-only input', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<DraftChecklistInput items={[]} onAdd={onAdd} onRemove={vi.fn()} />);

    await user.click(screen.getByText('Add checklist'));
    await user.type(screen.getByLabelText(/new checklist item/i), '   {Enter}');

    expect(onAdd).not.toHaveBeenCalled();
  });

  it('renders items with remove buttons', async () => {
    const user = userEvent.setup();
    render(
      <DraftChecklistInput
        items={['Item A', 'Item B']}
        onAdd={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    await user.click(screen.getByText('Add checklist'));

    expect(screen.getByText('Item A')).toBeInTheDocument();
    expect(screen.getByText('Item B')).toBeInTheDocument();
    expect(screen.getByLabelText('Remove "Item A"')).toBeInTheDocument();
    expect(screen.getByLabelText('Remove "Item B"')).toBeInTheDocument();
  });

  it('calls onRemove with correct index', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(
      <DraftChecklistInput
        items={['Item A', 'Item B']}
        onAdd={vi.fn()}
        onRemove={onRemove}
      />,
    );

    await user.click(screen.getByText('Add checklist'));
    await user.click(screen.getByLabelText('Remove "Item B"'));

    expect(onRemove).toHaveBeenCalledWith(1);
  });

  it('does not render list when no items', async () => {
    const user = userEvent.setup();
    render(
      <DraftChecklistInput items={[]} onAdd={vi.fn()} onRemove={vi.fn()} />,
    );

    await user.click(screen.getByText('Add checklist'));

    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('clears input after adding an item', async () => {
    const user = userEvent.setup();
    render(
      <DraftChecklistInput items={[]} onAdd={vi.fn()} onRemove={vi.fn()} />,
    );

    await user.click(screen.getByText('Add checklist'));
    const input = screen.getByLabelText(/new checklist item/i);
    await user.type(input, 'Buy milk{Enter}');

    expect(input).toHaveValue('');
  });
});
