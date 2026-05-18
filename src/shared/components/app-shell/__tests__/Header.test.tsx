import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Header } from '../Header';
import type { UserMenuProps } from '../app-shell.types';

const defaultUserMenu: UserMenuProps = {
  displayName: 'Test User',
  email: 'test@example.com',
  avatarUrl: null,
  onSignOut: vi.fn(),
  isSigningOut: false,
};

describe('Header', () => {
  it('renders the app name for mobile', () => {
    render(
      <MemoryRouter>
        <Header
          appName="TaskOps"
          isCollapsed={false}
          onToggleMobileSidebar={vi.fn()}
          userMenu={defaultUserMenu}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('TaskOps')).toBeInTheDocument();
    expect(screen.getByText('TaskOps')).toHaveClass('md:hidden');
  });

  it('renders a hamburger button with correct aria-label', () => {
    render(
      <MemoryRouter>
        <Header
          appName="TaskOps"
          isCollapsed={false}
          onToggleMobileSidebar={vi.fn()}
          userMenu={defaultUserMenu}
        />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('button', { name: 'Open menu' }),
    ).toBeInTheDocument();
  });

  it('calls onToggleMobileSidebar when hamburger button is clicked', async () => {
    const user = userEvent.setup();
    const onToggleMobileSidebar = vi.fn();

    render(
      <MemoryRouter>
        <Header
          appName="TaskOps"
          isCollapsed={false}
          onToggleMobileSidebar={onToggleMobileSidebar}
          userMenu={defaultUserMenu}
        />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: 'Open menu' }));

    expect(onToggleMobileSidebar).toHaveBeenCalledOnce();
  });

  it('hamburger button has md:hidden class so it is only visible on mobile', () => {
    render(
      <MemoryRouter>
        <Header
          appName="TaskOps"
          isCollapsed={false}
          onToggleMobileSidebar={vi.fn()}
          userMenu={defaultUserMenu}
        />
      </MemoryRouter>,
    );

    const hamburgerButton = screen.getByRole('button', { name: 'Open menu' });

    expect(hamburgerButton).toHaveClass('md:hidden');
  });

  it('uses narrower left padding when sidebar is collapsed', () => {
    const { container } = render(
      <MemoryRouter>
        <Header
          appName="TaskOps"
          isCollapsed={true}
          onToggleMobileSidebar={vi.fn()}
          userMenu={defaultUserMenu}
        />
      </MemoryRouter>,
    );

    expect(container.querySelector('header')).toHaveClass('md:pl-20');
  });

  it('renders user menu button in header', () => {
    render(
      <MemoryRouter>
        <Header
          appName="TaskOps"
          isCollapsed={false}
          onToggleMobileSidebar={vi.fn()}
          userMenu={defaultUserMenu}
        />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('button', { name: /user menu/i }),
    ).toBeInTheDocument();
  });
});
