import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { DeleteAccountDialog } from '../DeleteAccountDialog';

const defaultProps = {
  isOpen: true,
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
  isPending: false,
  error: null,
};

describe('DeleteAccountDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders warning text and consequences list when open', () => {
    render(<DeleteAccountDialog {...defaultProps} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      screen.getByText(/permanent and cannot be undone/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/all tasks and checklists/i)).toBeInTheDocument();
    expect(screen.getByText(/all recurrence templates/i)).toBeInTheDocument();
    expect(screen.getByText(/inbox items/i)).toBeInTheDocument();
    expect(screen.getByText(/profile and avatar/i)).toBeInTheDocument();
    expect(screen.getByText(/activity history/i)).toBeInTheDocument();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <DeleteAccountDialog {...defaultProps} isOpen={false} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('confirm button is disabled until DELETE is typed', () => {
    render(<DeleteAccountDialog {...defaultProps} />);

    const confirmButton = screen.getByRole('button', {
      name: /delete account/i,
    });
    expect(confirmButton).toBeDisabled();
  });

  it('enables confirm button after typing DELETE', async () => {
    const user = userEvent.setup();
    render(<DeleteAccountDialog {...defaultProps} />);

    const input = screen.getByPlaceholderText('DELETE');
    await user.type(input, 'DELETE');

    const confirmButton = screen.getByRole('button', {
      name: /delete account/i,
    });
    expect(confirmButton).toBeEnabled();
  });

  it('confirmation is case-insensitive', async () => {
    const user = userEvent.setup();
    render(<DeleteAccountDialog {...defaultProps} />);

    const input = screen.getByPlaceholderText('DELETE');
    await user.type(input, 'delete');

    const confirmButton = screen.getByRole('button', {
      name: /delete account/i,
    });
    expect(confirmButton).toBeEnabled();
  });

  it('confirmation trims whitespace', async () => {
    const user = userEvent.setup();
    render(<DeleteAccountDialog {...defaultProps} />);

    const input = screen.getByPlaceholderText('DELETE');
    await user.type(input, '  DELETE  ');

    const confirmButton = screen.getByRole('button', {
      name: /delete account/i,
    });
    expect(confirmButton).toBeEnabled();
  });

  it('calls onConfirm when confirmed and clicked', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<DeleteAccountDialog {...defaultProps} onConfirm={onConfirm} />);

    const input = screen.getByPlaceholderText('DELETE');
    await user.type(input, 'DELETE');

    const confirmButton = screen.getByRole('button', {
      name: /delete account/i,
    });
    await user.click(confirmButton);

    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('does not call onConfirm when input is wrong', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<DeleteAccountDialog {...defaultProps} onConfirm={onConfirm} />);

    const input = screen.getByPlaceholderText('DELETE');
    await user.type(input, 'WRONG');

    const confirmButton = screen.getByRole('button', {
      name: /delete account/i,
    });
    expect(confirmButton).toBeDisabled();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('cancel resets input and calls onCancel', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<DeleteAccountDialog {...defaultProps} onCancel={onCancel} />);

    const input = screen.getByPlaceholderText('DELETE');
    await user.type(input, 'DEL');

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('shows loading state when isPending', () => {
    render(<DeleteAccountDialog {...defaultProps} isPending={true} />);

    expect(screen.getByText(/deleting/i)).toBeInTheDocument();
    const confirmButton = screen.getByRole('button', {
      name: /deleting/i,
    });
    expect(confirmButton).toBeDisabled();
  });

  it('shows error message when error is provided', () => {
    render(
      <DeleteAccountDialog
        {...defaultProps}
        error="Account deletion failed. Please try again."
      />,
    );

    expect(
      screen.getByText('Account deletion failed. Please try again.'),
    ).toBeInTheDocument();
  });

  it('calls onCancel when Escape is pressed', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<DeleteAccountDialog {...defaultProps} onCancel={onCancel} />);

    await user.keyboard('{Escape}');

    expect(onCancel).toHaveBeenCalledOnce();
  });
});
