import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { UserMenu } from '../UserMenu';
import type { UserMenuProps } from '../app-shell.types';

const defaultProps: UserMenuProps = {
  displayName: 'Test User',
  email: 'test@example.com',
  avatarUrl: 'https://example.com/avatar.png',
  onSignOut: vi.fn(),
  isSigningOut: false,
};

function renderMenu(props: Partial<UserMenuProps> = {}) {
  return render(
    <MemoryRouter>
      <UserMenu {...defaultProps} {...props} />
    </MemoryRouter>,
  );
}

describe('UserMenu', () => {
  it('dropdown is closed by default', () => {
    renderMenu();
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('opens on click and aria-expanded changes to true', async () => {
    const user = userEvent.setup();
    renderMenu();

    const trigger = screen.getByRole('button', { name: /user menu/i });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);

    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('renders avatar with provided avatarUrl', async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(screen.getByRole('button', { name: /user menu/i }));

    const imgs = screen.getAllByAltText('Test User');
    expect(imgs[0]).toHaveAttribute('src', 'https://example.com/avatar.png');
  });

  it('renders fallback when avatarUrl is null', () => {
    renderMenu({ avatarUrl: null });

    const trigger = screen.getByRole('button', { name: /user menu/i });
    const triggerImg = trigger.querySelector('img');
    expect(triggerImg).toHaveAttribute('src', '/image-noPhotoPerfil.png');
  });

  it('shows displayName and email when open', async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(screen.getByRole('button', { name: /user menu/i }));

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('shows email as primary when displayName is null', async () => {
    const user = userEvent.setup();
    renderMenu({ displayName: null });

    await user.click(screen.getByRole('button', { name: /user menu/i }));

    const emailEls = screen.getAllByText('test@example.com');
    expect(emailEls.length).toBeGreaterThan(0);
    expect(screen.queryByText('Test User')).toBeNull();
  });

  it('renders Account link and Settings link', async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(screen.getByRole('button', { name: /user menu/i }));

    expect(screen.getByRole('menuitem', { name: /account/i })).toHaveAttribute(
      'href',
      '/app/account',
    );
    expect(screen.getByRole('menuitem', { name: /settings/i })).toHaveAttribute(
      'href',
      '/app/settings',
    );
  });

  it('closes on Escape key', async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(screen.getByRole('button', { name: /user menu/i }));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('closes on pointerdown outside', async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(screen.getByRole('button', { name: /user menu/i }));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    fireEvent.pointerDown(document.body);

    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('closes when Account link is clicked', async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(screen.getByRole('button', { name: /user menu/i }));
    await user.click(screen.getByRole('menuitem', { name: /account/i }));

    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('calls onSignOut when Sign out is clicked', async () => {
    const user = userEvent.setup();
    const onSignOut = vi.fn();
    renderMenu({ onSignOut });

    await user.click(screen.getByRole('button', { name: /user menu/i }));
    await user.click(screen.getByRole('menuitem', { name: /sign out/i }));

    expect(onSignOut).toHaveBeenCalledOnce();
  });

  it('sign out button is disabled when isSigningOut is true', async () => {
    const user = userEvent.setup();
    renderMenu({ isSigningOut: true });

    await user.click(screen.getByRole('button', { name: /user menu/i }));

    const signOutBtn = screen.getByRole('menuitem', { name: /signing out/i });
    expect(signOutBtn).toBeDisabled();
  });

  it('trigger button has aria-haspopup="menu"', () => {
    renderMenu();
    expect(screen.getByRole('button', { name: /user menu/i })).toHaveAttribute(
      'aria-haspopup',
      'menu',
    );
  });
});
