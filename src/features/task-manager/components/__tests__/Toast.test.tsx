import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { Toast } from '../Toast';

describe('Toast', () => {
  it('renders the toast message', () => {
    render(
      <Toast
        id="toast-1"
        message="Task created successfully"
        type="success"
        onDismiss={vi.fn()}
      />,
    );

    expect(screen.getByText('Task created successfully')).toBeInTheDocument();
  });

  it('renders with success styling when type is success', () => {
    render(
      <Toast
        id="toast-1"
        message="Operation successful"
        type="success"
        onDismiss={vi.fn()}
      />,
    );

    const toast = screen.getByRole('status');
    expect(toast.className).toMatch(/green/);
  });

  it('renders with error styling when type is error', () => {
    render(
      <Toast
        id="toast-1"
        message="Something went wrong"
        type="error"
        onDismiss={vi.fn()}
      />,
    );

    const toast = screen.getByRole('alert');
    expect(toast.className).toMatch(/red/);
  });

  it('renders with info styling when type is info', () => {
    render(
      <Toast id="toast-1" message="Heads up" type="info" onDismiss={vi.fn()} />,
    );

    const toast = screen.getByRole('status');
    expect(toast.className).toMatch(/blue/);
  });

  it('calls onDismiss with the toast id when close button is clicked', async () => {
    const onDismiss = vi.fn();
    const user = userEvent.setup();

    render(
      <Toast
        id="toast-42"
        message="Dismissable toast"
        type="info"
        onDismiss={onDismiss}
      />,
    );

    await user.click(screen.getByRole('button', { name: /dismiss|close/i }));

    expect(onDismiss).toHaveBeenCalledOnce();
    expect(onDismiss).toHaveBeenCalledWith('toast-42');
  });

  it('has role="status" for success and info toasts', () => {
    const { rerender } = render(
      <Toast
        id="toast-1"
        message="Success"
        type="success"
        onDismiss={vi.fn()}
      />,
    );

    expect(screen.getByRole('status')).toBeInTheDocument();

    rerender(
      <Toast id="toast-1" message="Info" type="info" onDismiss={vi.fn()} />,
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has role="alert" for error toasts', () => {
    render(
      <Toast
        id="toast-1"
        message="Error occurred"
        type="error"
        onDismiss={vi.fn()}
      />,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
