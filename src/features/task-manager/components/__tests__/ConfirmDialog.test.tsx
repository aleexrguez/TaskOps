import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { ConfirmDialog } from '../ConfirmDialog';

const defaultProps = {
  isOpen: true,
  title: 'Delete item',
  description: 'Are you sure you want to delete this?',
  confirmLabel: 'Delete',
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
};

describe('ConfirmDialog — accessibility', () => {
  it('dialog has aria-labelledby pointing to title', () => {
    render(<ConfirmDialog {...defaultProps} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby', 'confirm-dialog-title');
    expect(screen.getByText('Delete item')).toHaveAttribute(
      'id',
      'confirm-dialog-title',
    );
  });

  it('dialog has aria-describedby pointing to description', () => {
    render(<ConfirmDialog {...defaultProps} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute(
      'aria-describedby',
      'confirm-dialog-description',
    );
    expect(
      screen.getByText('Are you sure you want to delete this?'),
    ).toHaveAttribute('id', 'confirm-dialog-description');
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <ConfirmDialog {...defaultProps} isOpen={false} />,
    );
    expect(container.firstChild).toBeNull();
  });
});
