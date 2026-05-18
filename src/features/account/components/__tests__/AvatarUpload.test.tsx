import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AvatarUpload } from '../AvatarUpload';

const defaultProps = {
  avatarUrl: null,
  onUpload: vi.fn(),
  isPending: false,
  error: null,
  hasCustomAvatar: false,
  onRemove: vi.fn(),
  isRemoving: false,
};

describe('AvatarUpload', () => {
  it('renders placeholder when no avatar URL', () => {
    render(<AvatarUpload {...defaultProps} />);

    expect(screen.getByLabelText('No avatar')).toBeInTheDocument();
  });

  it('renders avatar image when URL provided', () => {
    render(
      <AvatarUpload {...defaultProps} avatarUrl="https://example.com/a.jpg" />,
    );

    expect(screen.getByAltText('User avatar')).toHaveAttribute(
      'src',
      'https://example.com/a.jpg',
    );
  });

  it('renders file input with accept for images only', () => {
    render(<AvatarUpload {...defaultProps} />);

    const input = screen.getByLabelText('Upload avatar image');
    expect(input).toHaveAttribute('accept', 'image/jpeg,image/png,image/webp');
  });

  it('calls onUpload with valid file', async () => {
    const user = userEvent.setup();
    const onUpload = vi.fn();
    render(<AvatarUpload {...defaultProps} onUpload={onUpload} />);

    const file = new File(['img'], 'photo.png', { type: 'image/png' });
    const input = screen.getByLabelText('Upload avatar image');
    await user.upload(input, file);

    expect(onUpload).toHaveBeenCalledWith(file);
  });

  it('does NOT call onUpload for non-image file', async () => {
    const user = userEvent.setup();
    const onUpload = vi.fn();
    render(<AvatarUpload {...defaultProps} onUpload={onUpload} />);

    const file = new File(['data'], 'doc.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText('Upload avatar image');
    await user.upload(input, file);

    expect(onUpload).not.toHaveBeenCalled();
  });

  it('does NOT call onUpload for file exceeding 2MB', async () => {
    const user = userEvent.setup();
    const onUpload = vi.fn();
    render(<AvatarUpload {...defaultProps} onUpload={onUpload} />);

    const largeContent = new Uint8Array(2 * 1024 * 1024 + 1);
    const file = new File([largeContent], 'big.png', { type: 'image/png' });
    const input = screen.getByLabelText('Upload avatar image');
    await user.upload(input, file);

    expect(onUpload).not.toHaveBeenCalled();
  });

  it('shows loading state when isPending', () => {
    render(<AvatarUpload {...defaultProps} isPending={true} />);

    expect(screen.getByRole('button', { name: /uploading/i })).toBeDisabled();
  });

  it('shows error message when error is set', () => {
    render(<AvatarUpload {...defaultProps} error="Upload failed" />);

    expect(screen.getByRole('alert')).toHaveTextContent('Upload failed');
  });

  it('shows constraint text', () => {
    render(<AvatarUpload {...defaultProps} />);

    expect(screen.getByText(/jpeg, png or webp/i)).toBeInTheDocument();
    expect(screen.getByText(/max 2mb/i)).toBeInTheDocument();
  });

  it('shows Remove photo button when hasCustomAvatar is true', () => {
    render(<AvatarUpload {...defaultProps} hasCustomAvatar={true} />);

    expect(
      screen.getByRole('button', { name: /remove photo/i }),
    ).toBeInTheDocument();
  });

  it('does NOT show Remove photo button when hasCustomAvatar is false', () => {
    render(<AvatarUpload {...defaultProps} hasCustomAvatar={false} />);

    expect(
      screen.queryByRole('button', { name: /remove photo/i }),
    ).not.toBeInTheDocument();
  });

  it('calls onRemove when Remove photo is clicked', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(
      <AvatarUpload
        {...defaultProps}
        hasCustomAvatar={true}
        onRemove={onRemove}
      />,
    );

    await user.click(screen.getByRole('button', { name: /remove photo/i }));

    expect(onRemove).toHaveBeenCalledOnce();
  });

  it('disables Remove photo button when isRemoving', () => {
    render(
      <AvatarUpload
        {...defaultProps}
        hasCustomAvatar={true}
        isRemoving={true}
      />,
    );

    expect(screen.getByRole('button', { name: /removing/i })).toBeDisabled();
  });
});
