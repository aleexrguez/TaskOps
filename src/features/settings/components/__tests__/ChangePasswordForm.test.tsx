import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ChangePasswordForm } from '../ChangePasswordForm';

const defaultProps = {
  onSubmit: vi.fn(),
  isPending: false,
  error: null,
  isSuccess: false,
  onReset: vi.fn(),
};

describe('ChangePasswordForm', () => {
  it('renders password and confirm password fields', () => {
    render(<ChangePasswordForm {...defaultProps} />);

    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it('validates minimum password length', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ChangePasswordForm {...defaultProps} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/new password/i), 'short');
    await user.type(screen.getByLabelText(/confirm password/i), 'short');
    await user.click(screen.getByRole('button', { name: /change password/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(
      screen.getByText(/password must be at least 8 characters/i),
    ).toBeInTheDocument();
  });

  it('validates passwords match', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ChangePasswordForm {...defaultProps} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/new password/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'different99');
    await user.click(screen.getByRole('button', { name: /change password/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it('calls onSubmit with valid password', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ChangePasswordForm {...defaultProps} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/new password/i), 'newpass123');
    await user.type(screen.getByLabelText(/confirm password/i), 'newpass123');
    await user.click(screen.getByRole('button', { name: /change password/i }));

    expect(onSubmit).toHaveBeenCalledWith('newpass123');
  });

  it('shows success message', () => {
    render(<ChangePasswordForm {...defaultProps} isSuccess={true} />);

    expect(
      screen.getByText(/password changed successfully/i),
    ).toBeInTheDocument();
  });

  it('shows error message', () => {
    render(
      <ChangePasswordForm {...defaultProps} error="Auth session expired" />,
    );

    expect(screen.getByText('Auth session expired')).toBeInTheDocument();
  });

  it('shows loading state when isPending', () => {
    render(<ChangePasswordForm {...defaultProps} isPending={true} />);

    expect(screen.getByRole('button', { name: /changing/i })).toBeDisabled();
  });

  it('password mismatch does NOT call onSubmit', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ChangePasswordForm {...defaultProps} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/new password/i), 'validpass1');
    await user.type(screen.getByLabelText(/confirm password/i), 'validpass2');
    await user.click(screen.getByRole('button', { name: /change password/i }));

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
