import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AccountSection } from '../AccountSection';

const defaultProps = {
  email: 'test@example.com',
  displayName: 'John Doe',
  avatarUrl: null,
  hasCustomAvatar: false,
  onSaveDisplayName: vi.fn(),
  isSavingName: false,
  saveNameError: null,
  onUploadAvatar: vi.fn(),
  isUploadingAvatar: false,
  uploadAvatarError: null,
  onRemoveAvatar: vi.fn(),
  isRemovingAvatar: false,
};

describe('AccountSection', () => {
  it('renders email as readonly text', () => {
    render(<AccountSection {...defaultProps} />);

    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('renders display name in editable input', () => {
    render(<AccountSection {...defaultProps} />);

    expect(screen.getByLabelText(/display name/i)).toHaveValue('John Doe');
  });

  it('renders empty input when displayName is null', () => {
    render(<AccountSection {...defaultProps} displayName={null} />);

    expect(screen.getByLabelText(/display name/i)).toHaveValue('');
  });

  it('calls onSaveDisplayName with updated name', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<AccountSection {...defaultProps} onSaveDisplayName={onSave} />);

    const input = screen.getByLabelText(/display name/i);
    await user.clear(input);
    await user.type(input, 'Jane');
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(onSave).toHaveBeenCalledWith('Jane');
  });

  it('shows error on save failure', () => {
    render(<AccountSection {...defaultProps} saveNameError="Update failed" />);

    expect(screen.getByRole('alert')).toHaveTextContent('Update failed');
  });

  it('shows default avatar fallback when no avatarUrl', () => {
    render(<AccountSection {...defaultProps} />);

    const img = screen.getByAltText('User avatar');
    expect(img).toHaveAttribute('src', '/image-noPhotoPerfil.png');
    // Vite serves public/ at root — never use /public/ prefix
    expect(img.getAttribute('src')).not.toContain('/public/');
  });

  it('shows custom avatar when avatarUrl provided', () => {
    render(
      <AccountSection
        {...defaultProps}
        avatarUrl="https://example.com/avatar.jpg"
      />,
    );

    const img = screen.getByAltText('User avatar');
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('disables save button when name has not changed', () => {
    render(<AccountSection {...defaultProps} />);

    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
  });

  it('syncs input when displayName prop changes (profile loads after mount)', () => {
    const { rerender } = render(
      <AccountSection {...defaultProps} displayName={null} />,
    );

    expect(screen.getByLabelText(/display name/i)).toHaveValue('');

    rerender(<AccountSection {...defaultProps} displayName="Loaded Name" />);

    expect(screen.getByLabelText(/display name/i)).toHaveValue('Loaded Name');
  });

  it('does NOT overwrite user edits when displayName prop changes', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <AccountSection {...defaultProps} displayName={null} />,
    );

    const input = screen.getByLabelText(/display name/i);
    await user.type(input, 'My Edit');

    rerender(<AccountSection {...defaultProps} displayName="Server Value" />);

    expect(input).toHaveValue('My Edit');
  });
});
