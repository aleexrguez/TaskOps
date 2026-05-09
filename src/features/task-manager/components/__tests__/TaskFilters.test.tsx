import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { TaskFilters } from '../TaskFilters';

const defaultProps = {
  statusFilter: 'all' as const,
  priorityFilter: 'all' as const,
  searchQuery: '',
  onStatusChange: vi.fn(),
  onPriorityChange: vi.fn(),
  onSearchChange: vi.fn(),
  onReset: vi.fn(),
  showArchived: false,
  onToggleArchived: vi.fn(),
};

describe('TaskFilters', () => {
  describe('showArchived toggle button', () => {
    it('renders "Show archived" button when showArchived is false', () => {
      render(<TaskFilters {...defaultProps} showArchived={false} />);

      expect(
        screen.getByRole('button', { name: /show archived/i }),
      ).toBeInTheDocument();
    });

    it('renders "Hide archived" button when showArchived is true', () => {
      render(<TaskFilters {...defaultProps} showArchived={true} />);

      expect(
        screen.getByRole('button', { name: /hide archived/i }),
      ).toBeInTheDocument();
    });

    it('calls onToggleArchived when the toggle button is clicked', async () => {
      const user = userEvent.setup();
      const onToggleArchived = vi.fn();

      render(
        <TaskFilters
          {...defaultProps}
          showArchived={false}
          onToggleArchived={onToggleArchived}
        />,
      );

      await user.click(screen.getByRole('button', { name: /show archived/i }));

      expect(onToggleArchived).toHaveBeenCalledOnce();
    });

    it('applies indigo background styling when showArchived is true (active state)', () => {
      render(<TaskFilters {...defaultProps} showArchived={true} />);

      const button = screen.getByRole('button', { name: /hide archived/i });
      expect(button.className).toMatch(/bg-indigo/);
    });

    it('does not apply indigo background styling when showArchived is false (inactive state)', () => {
      render(<TaskFilters {...defaultProps} showArchived={false} />);

      const button = screen.getByRole('button', { name: /show archived/i });
      expect(button.className).not.toMatch(/bg-indigo/);
    });
  });
});

describe('TaskFilters — mobile collapse', () => {
  it('renders a Filters toggle button with aria-expanded="false"', () => {
    render(<TaskFilters {...defaultProps} />);

    expect(screen.getByRole('button', { name: /filters/i })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('sets aria-expanded="true" and shows filter panel when toggle is clicked', async () => {
    const user = userEvent.setup();
    render(<TaskFilters {...defaultProps} />);

    const toggleButton = screen.getByRole('button', { name: /filters/i });
    await user.click(toggleButton);

    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    expect(toggleButton).toHaveAttribute('aria-controls', 'task-filters-panel');

    const panel = document.getElementById('task-filters-panel');
    expect(panel).not.toHaveClass('hidden');
  });

  it('shows badge with active filter count when filters are active', () => {
    render(
      <TaskFilters
        {...defaultProps}
        searchQuery="test"
        priorityFilter="high"
      />,
    );

    const toggleButton = screen.getByRole('button', { name: /filters/i });
    expect(toggleButton).toHaveTextContent('2');
  });

  it('does not show badge when no filters are active', () => {
    render(<TaskFilters {...defaultProps} />);

    const toggleButton = screen.getByRole('button', { name: /filters/i });
    expect(toggleButton.textContent).toMatch(/^Filters$/);
  });

  it('filter controls remain accessible when panel is expanded', async () => {
    const user = userEvent.setup();
    render(<TaskFilters {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /filters/i }));

    expect(
      screen.getByRole('textbox', { name: /search tasks/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('combobox', { name: /filter by status/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('combobox', { name: /filter by priority/i }),
    ).toBeInTheDocument();
  });
});

describe('TaskFilters — accessibility', () => {
  it('search input has accessible name', () => {
    render(<TaskFilters {...defaultProps} />);

    expect(
      screen.getByRole('textbox', { name: /search tasks/i }),
    ).toBeInTheDocument();
  });

  it('status select has accessible name', () => {
    render(<TaskFilters {...defaultProps} />);

    expect(
      screen.getByRole('combobox', { name: /filter by status/i }),
    ).toBeInTheDocument();
  });

  it('priority select has accessible name', () => {
    render(<TaskFilters {...defaultProps} />);

    expect(
      screen.getByRole('combobox', { name: /filter by priority/i }),
    ).toBeInTheDocument();
  });

  it('archived toggle has aria-pressed="false" when not showing archived', () => {
    render(<TaskFilters {...defaultProps} showArchived={false} />);

    expect(
      screen.getByRole('button', { name: /show archived/i }),
    ).toHaveAttribute('aria-pressed', 'false');
  });

  it('archived toggle has aria-pressed="true" when showing archived', () => {
    render(<TaskFilters {...defaultProps} showArchived={true} />);

    expect(
      screen.getByRole('button', { name: /hide archived/i }),
    ).toHaveAttribute('aria-pressed', 'true');
  });
});
