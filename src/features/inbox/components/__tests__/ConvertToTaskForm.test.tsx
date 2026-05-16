import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ConvertToTaskForm } from '../ConvertToTaskForm';

describe('ConvertToTaskForm', () => {
  it('pre-fills title and description from inbox item', () => {
    render(
      <ConvertToTaskForm
        initialTitle="My idea"
        initialDescription="Some notes here"
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByLabelText(/Title/)).toHaveValue('My idea');
    expect(screen.getByLabelText(/Description/)).toHaveValue('Some notes here');
  });

  it('defaults status to todo and priority to medium', () => {
    render(
      <ConvertToTaskForm
        initialTitle="Test"
        initialDescription=""
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByLabelText(/Status/)).toHaveValue('todo');
    expect(screen.getByLabelText(/Priority/)).toHaveValue('medium');
  });

  it('submits with all field values and empty checklist', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <ConvertToTaskForm
        initialTitle="My task"
        initialDescription="Description text"
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />,
    );

    await user.selectOptions(screen.getByLabelText(/Status/), 'in-progress');
    await user.selectOptions(screen.getByLabelText(/Priority/), 'high');

    await user.click(screen.getByText('Convert to Task'));

    expect(onSubmit).toHaveBeenCalledWith({
      taskInput: {
        title: 'My task',
        description: 'Description text',
        status: 'in-progress',
        priority: 'high',
      },
      checklistTitles: [],
    });
  });

  it('does not include description when empty', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <ConvertToTaskForm
        initialTitle="No desc"
        initialDescription=""
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />,
    );

    await user.click(screen.getByText('Convert to Task'));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        taskInput: expect.objectContaining({ description: undefined }),
      }),
    );
  });

  it('disables submit when isSubmitting', () => {
    render(
      <ConvertToTaskForm
        initialTitle="Test"
        initialDescription=""
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        isSubmitting
      />,
    );

    expect(screen.getByText('Converting...')).toBeDisabled();
  });

  it('calls onCancel when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(
      <ConvertToTaskForm
        initialTitle="Test"
        initialDescription=""
        onSubmit={vi.fn()}
        onCancel={onCancel}
      />,
    );

    await user.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalled();
  });

  it('allows adding checklist items', async () => {
    const user = userEvent.setup();

    render(
      <ConvertToTaskForm
        initialTitle="Test"
        initialDescription=""
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    await user.click(screen.getByText('Add checklist'));

    const input = screen.getByLabelText('New checklist item');
    await user.type(input, 'Step 1');
    await user.click(screen.getByLabelText('Add checklist item'));

    expect(screen.getByText('Step 1')).toBeInTheDocument();

    await user.type(input, 'Step 2');
    await user.keyboard('{Enter}');

    expect(screen.getByText('Step 2')).toBeInTheDocument();
  });

  it('allows removing checklist items', async () => {
    const user = userEvent.setup();

    render(
      <ConvertToTaskForm
        initialTitle="Test"
        initialDescription=""
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    await user.click(screen.getByText('Add checklist'));

    const input = screen.getByLabelText('New checklist item');
    await user.type(input, 'Remove me');
    await user.click(screen.getByLabelText('Add checklist item'));

    expect(screen.getByText('Remove me')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Remove Remove me'));

    expect(screen.queryByText('Remove me')).not.toBeInTheDocument();
  });

  it('includes checklist items in submit', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <ConvertToTaskForm
        initialTitle="Test"
        initialDescription=""
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />,
    );

    await user.click(screen.getByText('Add checklist'));

    const input = screen.getByLabelText('New checklist item');
    await user.type(input, 'Item A');
    await user.click(screen.getByLabelText('Add checklist item'));
    await user.type(input, 'Item B');
    await user.click(screen.getByLabelText('Add checklist item'));

    await user.click(screen.getByText('Convert to Task'));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        checklistTitles: ['Item A', 'Item B'],
      }),
    );
  });
});
