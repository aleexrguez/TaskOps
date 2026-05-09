import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TaskForm } from '../TaskForm';

describe('TaskForm — dueDate support', () => {
  it('renders a due date picker', () => {
    render(<TaskForm onSubmit={vi.fn()} />);
    const trigger = screen.getByLabelText(/due date/i);
    expect(trigger).toBeInTheDocument();
    expect(trigger.tagName).toBe('BUTTON');
  });

  it('dueDate picker shows "Select date" by default', () => {
    render(<TaskForm onSubmit={vi.fn()} />);
    expect(screen.getByText('Select date')).toBeInTheDocument();
  });

  it('populates dueDate from initialValues', () => {
    render(
      <TaskForm onSubmit={vi.fn()} initialValues={{ dueDate: '2026-05-15' }} />,
    );
    expect(screen.getByText('May 15, 2026')).toBeInTheDocument();
  });

  it('includes dueDate in submit payload when a day is selected', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TaskForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/title/i), 'My Task');

    await user.click(screen.getByLabelText(/due date/i));
    const cells = screen.getAllByRole('gridcell');
    const dayCell = cells.find((cell) => cell.querySelector('button') !== null);
    expect(dayCell).toBeDefined();
    await user.click(dayCell!.querySelector('button')!);

    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(onSubmit).toHaveBeenCalledOnce();
    const payload = onSubmit.mock.calls[0][0] as Record<string, unknown>;
    expect(payload.dueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('does NOT include dueDate in submit payload when empty', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TaskForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/title/i), 'My Task');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(onSubmit).toHaveBeenCalledOnce();
    const payload = onSubmit.mock.calls[0][0];
    expect(payload.dueDate).toBeUndefined();
  });
});
