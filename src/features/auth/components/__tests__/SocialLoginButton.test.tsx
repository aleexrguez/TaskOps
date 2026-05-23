import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect } from 'vitest';
import { SocialLoginButton } from '../SocialLoginButton';

function renderButton(overrides = {}) {
  const props = {
    label: 'Continue with Google',
    pendingLabel: 'Redirecting to Google...',
    onClick: vi.fn(),
    isPending: false,
    icon: <svg data-testid="icon" />,
    ...overrides,
  };
  render(<SocialLoginButton {...props} />);
  return props;
}

describe('SocialLoginButton', () => {
  it('renders label and icon', () => {
    renderButton();

    expect(
      screen.getByRole('button', { name: /continue with google/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const props = renderButton();

    await user.click(
      screen.getByRole('button', { name: /continue with google/i }),
    );

    expect(props.onClick).toHaveBeenCalledTimes(1);
  });

  it('shows pendingLabel and is disabled when isPending', () => {
    renderButton({ isPending: true });

    const button = screen.getByRole('button', {
      name: /redirecting to google/i,
    });
    expect(button).toBeDisabled();
  });

  it('does not show pendingLabel when not pending', () => {
    renderButton();

    expect(
      screen.queryByText(/redirecting to google/i),
    ).not.toBeInTheDocument();
  });
});
