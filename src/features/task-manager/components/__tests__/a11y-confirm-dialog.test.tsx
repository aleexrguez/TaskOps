import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { ConfirmDialog } from '../ConfirmDialog';

const defaultProps = {
  isOpen: true,
  title: 'Delete task',
  description: 'Are you sure?',
  confirmLabel: 'Delete',
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
  variant: 'danger' as const,
};

describe('ConfirmDialog accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('has role="dialog" and aria-modal="true" when open', () => {
    render(<ConfirmDialog {...defaultProps} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('has aria-labelledby pointing to the title element', () => {
    render(<ConfirmDialog {...defaultProps} />);

    const dialog = screen.getByRole('dialog');
    const labelledById = dialog.getAttribute('aria-labelledby');
    expect(labelledById).toBeTruthy();

    const titleElement = document.getElementById(labelledById!);
    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toHaveTextContent('Delete task');
  });

  it('moves focus into the dialog when opened', () => {
    render(<ConfirmDialog {...defaultProps} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it('traps focus within the dialog on Tab', async () => {
    const user = userEvent.setup();
    render(<ConfirmDialog {...defaultProps} />);

    const dialog = screen.getByRole('dialog');
    const focusableElements = dialog.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    lastElement.focus();
    expect(document.activeElement).toBe(lastElement);

    await user.tab();

    const firstElement = focusableElements[0] as HTMLElement;
    expect(document.activeElement).toBe(firstElement);
  });

  it('traps focus on Shift+Tab from first element', async () => {
    const user = userEvent.setup();
    render(<ConfirmDialog {...defaultProps} />);

    const dialog = screen.getByRole('dialog');
    const focusableElements = dialog.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const firstElement = focusableElements[0] as HTMLElement;

    firstElement.focus();
    expect(document.activeElement).toBe(firstElement);

    await user.tab({ shift: true });

    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;
    expect(document.activeElement).toBe(lastElement);
  });

  it('calls onCancel when Escape is pressed', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(<ConfirmDialog {...defaultProps} onCancel={onCancel} />);

    await user.keyboard('{Escape}');

    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('has aria-label on the close button', () => {
    render(<ConfirmDialog {...defaultProps} />);

    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
  });
});
