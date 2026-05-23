import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { LoginForm } from '../LoginForm';

function renderLoginForm(props: Partial<Parameters<typeof LoginForm>[0]> = {}) {
  return render(
    <MemoryRouter>
      <LoginForm onSubmit={vi.fn()} isPending={false} error={null} {...props} />
    </MemoryRouter>,
  );
}

function getPasswordInput() {
  return document.getElementById('password') as HTMLInputElement;
}

describe('LoginForm — password visibility toggle', () => {
  it('renders password input with type="password" by default', () => {
    renderLoginForm();

    expect(getPasswordInput()).toHaveAttribute('type', 'password');
  });

  it('toggles password input to type="text" when show button is clicked', async () => {
    const user = userEvent.setup();
    renderLoginForm();

    await user.click(screen.getByRole('button', { name: /show password/i }));

    expect(getPasswordInput()).toHaveAttribute('type', 'text');
  });

  it('toggles back to type="password" on second click', async () => {
    const user = userEvent.setup();
    renderLoginForm();

    await user.click(screen.getByRole('button', { name: /show password/i }));
    expect(getPasswordInput()).toHaveAttribute('type', 'text');

    await user.click(screen.getByRole('button', { name: /hide password/i }));
    expect(getPasswordInput()).toHaveAttribute('type', 'password');
  });

  it('updates aria-label when toggled', async () => {
    const user = userEvent.setup();
    renderLoginForm();

    const toggleBtn = screen.getByRole('button', { name: /show password/i });
    await user.click(toggleBtn);

    expect(
      screen.getByRole('button', { name: /hide password/i }),
    ).toBeInTheDocument();
  });

  it('toggle button is keyboard operable', async () => {
    const user = userEvent.setup();
    renderLoginForm();

    const toggleBtn = screen.getByRole('button', { name: /show password/i });
    toggleBtn.focus();
    await user.keyboard('{Enter}');

    expect(getPasswordInput()).toHaveAttribute('type', 'text');
  });
});

describe('LoginForm — forgot password link', () => {
  it('renders a "Forgot password?" link pointing to /forgot-password', () => {
    renderLoginForm();

    const link = screen.getByText(/forgot password/i);
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', '/forgot-password');
  });
});

describe('LoginForm — Google OAuth', () => {
  it('renders Google button when onGoogleSignIn is provided', () => {
    renderLoginForm({ onGoogleSignIn: vi.fn() });

    expect(
      screen.getByRole('button', { name: /continue with google/i }),
    ).toBeInTheDocument();
  });

  it('does not render Google button when onGoogleSignIn is omitted', () => {
    renderLoginForm();

    expect(
      screen.queryByRole('button', { name: /continue with google/i }),
    ).not.toBeInTheDocument();
  });

  it('calls onGoogleSignIn on Google button click', async () => {
    const user = userEvent.setup();
    const onGoogleSignIn = vi.fn();
    renderLoginForm({ onGoogleSignIn });

    await user.click(
      screen.getByRole('button', { name: /continue with google/i }),
    );

    expect(onGoogleSignIn).toHaveBeenCalledTimes(1);
  });

  it('shows googleError alert when provided', () => {
    renderLoginForm({
      onGoogleSignIn: vi.fn(),
      googleError: 'Provider not enabled',
    });

    expect(screen.getByText('Provider not enabled')).toBeInTheDocument();
  });

  it('renders divider when Google is enabled', () => {
    renderLoginForm({ onGoogleSignIn: vi.fn() });

    expect(screen.getByText(/or continue with email/i)).toBeInTheDocument();
  });

  it('disables email submit when isGooglePending is true', () => {
    renderLoginForm({ onGoogleSignIn: vi.fn(), isGooglePending: true });

    expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled();
  });
});
