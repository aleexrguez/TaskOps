import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DemoBanner } from '../DemoBanner';

describe('DemoBanner', () => {
  it('renders the banner message text', () => {
    render(<DemoBanner onSignUpClick={vi.fn()} />);

    expect(
      screen.getByText(
        "You're exploring the demo workspace. Feel free to test TaskOps — demo data may be reset periodically.",
      ),
    ).toBeInTheDocument();
  });

  it('renders the "Sign up for free" button', () => {
    render(<DemoBanner onSignUpClick={vi.fn()} />);

    expect(
      screen.getByRole('button', { name: 'Sign up for free' }),
    ).toBeInTheDocument();
  });

  it('calls onSignUpClick when button is clicked', async () => {
    const user = userEvent.setup();
    const handleSignUpClick = vi.fn();

    render(<DemoBanner onSignUpClick={handleSignUpClick} />);

    await user.click(screen.getByRole('button', { name: 'Sign up for free' }));

    expect(handleSignUpClick).toHaveBeenCalledOnce();
  });
});
