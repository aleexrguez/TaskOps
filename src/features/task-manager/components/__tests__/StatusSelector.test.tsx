import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { StatusSelector } from '../StatusSelector';

describe('StatusSelector', () => {
  it('renders current status label', () => {
    render(<StatusSelector status="in-progress" onStatusChange={vi.fn()} />);

    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('opens dropdown on click', async () => {
    const user = userEvent.setup();

    render(<StatusSelector status="todo" onStatusChange={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /todo/i }));

    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('shows all three status options', async () => {
    const user = userEvent.setup();

    render(<StatusSelector status="todo" onStatusChange={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /todo/i }));

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(3);
    expect(screen.getByRole('option', { name: /todo/i })).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: /in progress/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /done/i })).toBeInTheDocument();
  });

  it('calls onStatusChange with correct status when option clicked', async () => {
    const user = userEvent.setup();
    const onStatusChange = vi.fn();

    render(<StatusSelector status="todo" onStatusChange={onStatusChange} />);

    await user.click(screen.getByRole('button', { name: /todo/i }));
    await user.click(screen.getByRole('option', { name: /done/i }));

    expect(onStatusChange).toHaveBeenCalledOnce();
    expect(onStatusChange).toHaveBeenCalledWith('done');
  });

  it('closes dropdown after selection', async () => {
    const user = userEvent.setup();

    render(<StatusSelector status="todo" onStatusChange={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /todo/i }));
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    await user.click(screen.getByRole('option', { name: /in progress/i }));

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('does not open when disabled', async () => {
    const user = userEvent.setup();

    render(
      <StatusSelector status="todo" onStatusChange={vi.fn()} disabled={true} />,
    );

    await user.click(screen.getByRole('button'));

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('closes on Escape key press', async () => {
    const user = userEvent.setup();

    render(<StatusSelector status="todo" onStatusChange={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /todo/i }));
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
