import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthModal } from '../AuthModal';

function renderModal(
  props: {
    title?: string;
    onClose?: () => void;
    children?: React.ReactNode;
  } = {},
) {
  const defaultProps = {
    title: 'Test Modal',
    onClose: vi.fn(),
    children: <input data-testid="test-input" />,
    ...props,
  };

  const result = render(
    <MemoryRouter>
      <AuthModal title={defaultProps.title} onClose={defaultProps.onClose}>
        {defaultProps.children}
      </AuthModal>
    </MemoryRouter>,
  );

  return {
    ...result,
    onClose: defaultProps.onClose,
  };
}

describe('AuthModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with role="dialog" and aria-modal="true"', () => {
    renderModal();

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('has aria-labelledby pointing to the title element', () => {
    renderModal({ title: 'My Auth Modal' });

    const dialog = screen.getByRole('dialog');
    const labelledById = dialog.getAttribute('aria-labelledby');
    expect(labelledById).toBeTruthy();

    const titleElement = document.getElementById(labelledById!);
    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toHaveTextContent('My Auth Modal');
  });

  it('renders children inside the modal', () => {
    renderModal({
      children: <input data-testid="form-input" />,
    });

    expect(screen.getByTestId('form-input')).toBeInTheDocument();
  });

  it('calls onClose when Escape is pressed', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    renderModal({ onClose });

    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when backdrop is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    const { container } = renderModal({ onClose });

    // The backdrop is the outermost fixed div (first child of MemoryRouter render)
    const backdrop = container.firstChild as HTMLElement;
    await user.click(backdrop);

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does NOT call onClose when clicking inside the modal card', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    renderModal({ onClose });

    const dialog = screen.getByRole('dialog');
    await user.click(dialog);

    expect(onClose).not.toHaveBeenCalled();
  });

  it('traps focus within the dialog on Tab', async () => {
    const user = userEvent.setup();
    renderModal();

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
    renderModal();

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

  it('has close button with aria-label', () => {
    renderModal();

    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
  });

  it('renders legal links inside the modal', () => {
    renderModal();

    expect(
      screen.getByRole('link', { name: /privacy policy/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /terms of service/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /cookie policy/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /legal notice/i }),
    ).toBeInTheDocument();
  });

  it('focuses the first input on open, not the close button', () => {
    renderModal({
      children: <input data-testid="email-input" />,
    });

    expect(document.activeElement).toBe(screen.getByTestId('email-input'));
  });

  it('focuses first focusable when no input exists', () => {
    renderModal({
      children: <button data-testid="action-btn">Action</button>,
    });

    const closeButton = screen.getByRole('button', { name: /close/i });
    expect(document.activeElement).toBe(closeButton);
  });

  it('close button has min touch target', () => {
    renderModal();

    const closeButton = screen.getByRole('button', { name: /close/i });
    expect(closeButton.className).toContain('min-h-[44px]');
    expect(closeButton.className).toContain('min-w-[44px]');
  });
});
