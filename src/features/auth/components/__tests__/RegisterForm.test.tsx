import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { RegisterForm } from '../RegisterForm';

function renderRegisterForm(
  props: Partial<Parameters<typeof RegisterForm>[0]> = {},
) {
  return render(
    <MemoryRouter>
      <RegisterForm
        onSubmit={vi.fn()}
        isPending={false}
        error={null}
        {...props}
      />
    </MemoryRouter>,
  );
}

describe('RegisterForm — password visibility toggle', () => {
  it('renders both password inputs with type="password" by default', () => {
    renderRegisterForm();

    const passwordInputs = screen.getAllByPlaceholderText('••••••');
    expect(passwordInputs).toHaveLength(2);
    expect(passwordInputs[0]).toHaveAttribute('type', 'password');
    expect(passwordInputs[1]).toHaveAttribute('type', 'password');
  });

  it('toggles password field independently from confirm password', async () => {
    const user = userEvent.setup();
    renderRegisterForm();

    const toggleButtons = screen.getAllByRole('button', {
      name: /show password/i,
    });
    expect(toggleButtons).toHaveLength(2);

    await user.click(toggleButtons[0]);

    expect(screen.getByLabelText(/^password/i)).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText(/confirm password/i)).toHaveAttribute(
      'type',
      'password',
    );
  });

  it('toggles confirm password field independently from password', async () => {
    const user = userEvent.setup();
    renderRegisterForm();

    const toggleButtons = screen.getAllByRole('button', {
      name: /show password/i,
    });

    await user.click(toggleButtons[1]);

    expect(screen.getByLabelText(/^password/i)).toHaveAttribute(
      'type',
      'password',
    );
    expect(screen.getByLabelText(/confirm password/i)).toHaveAttribute(
      'type',
      'text',
    );
  });
});

describe('RegisterForm — Google OAuth', () => {
  it('renders Google button when onGoogleSignIn is provided', () => {
    renderRegisterForm({ onGoogleSignIn: vi.fn() });

    expect(
      screen.getByRole('button', { name: /continue with google/i }),
    ).toBeInTheDocument();
  });

  it('does not render Google button when onGoogleSignIn is omitted', () => {
    renderRegisterForm();

    expect(
      screen.queryByRole('button', { name: /continue with google/i }),
    ).not.toBeInTheDocument();
  });

  it('calls onGoogleSignIn on Google button click', async () => {
    const user = userEvent.setup();
    const onGoogleSignIn = vi.fn();
    renderRegisterForm({ onGoogleSignIn });

    await user.click(
      screen.getByRole('button', { name: /continue with google/i }),
    );

    expect(onGoogleSignIn).toHaveBeenCalledTimes(1);
  });

  it('shows googleError alert when provided', () => {
    renderRegisterForm({
      onGoogleSignIn: vi.fn(),
      googleError: 'Provider not enabled',
    });

    expect(screen.getByText('Provider not enabled')).toBeInTheDocument();
  });

  it('renders divider when Google is enabled', () => {
    renderRegisterForm({ onGoogleSignIn: vi.fn() });

    expect(screen.getByText(/or continue with email/i)).toBeInTheDocument();
  });

  it('disables email submit when isGooglePending is true', () => {
    renderRegisterForm({ onGoogleSignIn: vi.fn(), isGooglePending: true });

    expect(
      screen.getByRole('button', { name: /create account/i }),
    ).toBeDisabled();
  });
});

describe('RegisterForm — email confirmation', () => {
  it('shows confirmation screen when isSuccess is true', () => {
    renderRegisterForm({ isSuccess: true });

    expect(screen.getByText(/check your email/i)).toBeInTheDocument();
    expect(
      screen.getByText(/we sent a confirmation link/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /create account/i }),
    ).not.toBeInTheDocument();
  });

  it('shows back to login link in confirmation screen', () => {
    renderRegisterForm({ isSuccess: true });

    const link = screen.getByText(/back to login/i);
    expect(link.closest('a')).toHaveAttribute('href', '/login');
  });

  it('does not show confirmation screen when isSuccess is false', () => {
    renderRegisterForm({ isSuccess: false });

    expect(screen.queryByText(/check your email/i)).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /create account/i }),
    ).toBeInTheDocument();
  });
});
