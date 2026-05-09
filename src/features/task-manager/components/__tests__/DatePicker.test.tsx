import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { format } from 'date-fns';
import { describe, expect, it, vi } from 'vitest';
import { DatePicker } from '../DatePicker';

describe('DatePicker', () => {
  it('shows "Select date" when no value', () => {
    render(<DatePicker onChange={vi.fn()} />);
    expect(
      screen.getByRole('button', { name: /select date/i }),
    ).toBeInTheDocument();
  });

  it('shows formatted date when value is provided', () => {
    render(<DatePicker value="2026-05-15" onChange={vi.fn()} />);
    expect(
      screen.getByRole('button', { name: /may 15, 2026/i }),
    ).toBeInTheDocument();
  });

  it('opens popover on trigger click and closes on second click', async () => {
    const user = userEvent.setup();
    render(<DatePicker onChange={vi.fn()} />);

    const trigger = screen.getByRole('button', { name: /select date/i });
    await user.click(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(trigger);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls onChange with YYYY-MM-DD string when a day is selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: /select date/i }));

    const cells = screen.getAllByRole('gridcell');
    const dayCell = cells.find((cell) => cell.querySelector('button') !== null);
    expect(dayCell).toBeDefined();
    const dayButton = dayCell!.querySelector('button')!;
    await user.click(dayButton);

    expect(onChange).toHaveBeenCalledOnce();
    const called = onChange.mock.calls[0][0] as string;
    expect(called).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('"Today" button calls onChange with today\'s date in YYYY-MM-DD', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: /select date/i }));
    await user.click(screen.getByText('Today'));

    const today = format(new Date(), 'yyyy-MM-dd');
    expect(onChange).toHaveBeenCalledWith(today);
  });

  it('"Clear" button calls onChange(undefined)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker value="2026-05-15" onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: /may 15, 2026/i }));
    await user.click(screen.getByRole('button', { name: /clear/i }));

    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it('closes popover on Escape key', async () => {
    const user = userEvent.setup();
    render(<DatePicker onChange={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /select date/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes popover on click outside', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <DatePicker onChange={vi.fn()} />
        <button type="button">Outside</button>
      </div>,
    );

    await user.click(screen.getByRole('button', { name: /select date/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /outside/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('disabled prop prevents popover from opening', async () => {
    const user = userEvent.setup();
    render(<DatePicker onChange={vi.fn()} disabled />);

    await user.click(screen.getByRole('button', { name: /select date/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
