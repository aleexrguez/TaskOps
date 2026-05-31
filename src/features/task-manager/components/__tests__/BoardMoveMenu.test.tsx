import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { BoardMoveMenu } from '../BoardMoveMenu';

describe('BoardMoveMenu', () => {
  it('renders the "Move" button', () => {
    render(<BoardMoveMenu currentStatus="todo" onMove={vi.fn()} />);

    expect(screen.getByRole('button', { name: /move/i })).toBeInTheDocument();
  });

  it('click on Move button opens dropdown with 2 destinations', async () => {
    const user = userEvent.setup();

    render(<BoardMoveMenu currentStatus="todo" onMove={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /move/i }));

    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getAllByRole('menuitem')).toHaveLength(2);
  });

  it('does not show current status as a destination', async () => {
    const user = userEvent.setup();

    render(<BoardMoveMenu currentStatus="todo" onMove={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /move/i }));

    const menuItems = screen.getAllByRole('menuitem');
    const labels = menuItems.map(
      (item) => item.getAttribute('aria-label') ?? item.textContent ?? '',
    );

    for (const label of labels) {
      expect(label).not.toMatch(/todo/i);
    }
  });

  it('click destination calls onMove with target status and closes dropdown', async () => {
    const user = userEvent.setup();
    const onMove = vi.fn();

    render(<BoardMoveMenu currentStatus="todo" onMove={onMove} />);

    await user.click(screen.getByRole('button', { name: /move/i }));
    await user.click(screen.getByRole('menuitem', { name: /in progress/i }));

    expect(onMove).toHaveBeenCalledOnce();
    expect(onMove).toHaveBeenCalledWith('in-progress');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('click destination calls stopPropagation', async () => {
    const user = userEvent.setup();
    const onMove = vi.fn();
    const parentClick = vi.fn();

    render(
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
      <div onClick={parentClick}>
        <BoardMoveMenu currentStatus="todo" onMove={onMove} />
      </div>,
    );

    await user.click(screen.getByRole('button', { name: /move/i }));
    await user.click(screen.getByRole('menuitem', { name: /in progress/i }));

    expect(onMove).toHaveBeenCalledOnce();
    expect(parentClick).not.toHaveBeenCalled();
  });

  it('click outside closes the dropdown', async () => {
    const user = userEvent.setup();

    render(
      <div>
        <BoardMoveMenu currentStatus="todo" onMove={vi.fn()} />
        <button>outside</button>
      </div>,
    );

    await user.click(screen.getByRole('button', { name: /^move$/i }));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'outside' }));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('pressing Escape closes the dropdown', async () => {
    const user = userEvent.setup();

    render(<BoardMoveMenu currentStatus="in-progress" onMove={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /move/i }));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('trigger button has aria-haspopup="menu" and aria-expanded reflects open state', async () => {
    const user = userEvent.setup();

    render(<BoardMoveMenu currentStatus="done" onMove={vi.fn()} />);

    const trigger = screen.getByRole('button', { name: /move/i });
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });
});
