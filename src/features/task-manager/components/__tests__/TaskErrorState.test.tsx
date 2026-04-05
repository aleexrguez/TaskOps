import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { TaskErrorState } from '../TaskErrorState';

describe('TaskErrorState', () => {
  it('renders the error message', () => {
    render(<TaskErrorState message="Something went wrong" onRetry={vi.fn()} />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders a retry button', () => {
    render(<TaskErrorState message="Something went wrong" onRetry={vi.fn()} />);

    expect(
      screen.getByRole('button', { name: /retry|try again/i }),
    ).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();

    render(<TaskErrorState message="Something went wrong" onRetry={onRetry} />);

    await user.click(screen.getByRole('button', { name: /retry|try again/i }));

    expect(onRetry).toHaveBeenCalledOnce();
  });
});
