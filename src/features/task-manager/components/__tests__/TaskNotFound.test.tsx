import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { TaskNotFound } from '../TaskNotFound';

describe('TaskNotFound', () => {
  it('renders a not found message', () => {
    render(<TaskNotFound onBack={vi.fn()} />);

    expect(screen.getByText(/task not found/i)).toBeInTheDocument();
  });

  it('renders a back to dashboard button/link', () => {
    render(<TaskNotFound onBack={vi.fn()} />);

    expect(
      screen.getByRole('button', { name: /back|dashboard/i }),
    ).toBeInTheDocument();
  });

  it('calls onBack when back button is clicked', async () => {
    const onBack = vi.fn();
    const user = userEvent.setup();

    render(<TaskNotFound onBack={onBack} />);

    await user.click(screen.getByRole('button', { name: /back|dashboard/i }));

    expect(onBack).toHaveBeenCalledOnce();
  });
});
