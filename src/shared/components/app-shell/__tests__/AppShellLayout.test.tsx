import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AppShellLayout } from '../AppShellLayout';
import type { AppShellLayoutProps, UserMenuProps } from '../app-shell.types';

vi.mock('@/shared/components/DemoBanner', () => ({
  DemoBanner: ({ onSignUpClick }: { onSignUpClick: () => void }) => (
    <div data-testid="demo-banner">
      <button onClick={onSignUpClick}>Sign up</button>
    </div>
  ),
}));

const defaultNavItems = [
  { label: 'Tasks', to: '/app/tasks', icon: '/TaskIcon.png' },
  { label: 'Recurrences', to: '/app/recurrences', icon: '/RecurrenceIcon.png' },
  { label: 'Settings', to: '/app/settings', icon: '/SettingsIcon.png' },
];

const defaultUserMenu: UserMenuProps = {
  displayName: 'Test User',
  email: 'test@example.com',
  avatarUrl: null,
  onSignOut: vi.fn(),
  isSigningOut: false,
};

const defaultProps: AppShellLayoutProps = {
  headerProps: {
    appName: 'TaskOps',
    isCollapsed: false,
    onToggleMobileSidebar: vi.fn(),
    userMenu: defaultUserMenu,
  },
  sidebarProps: {
    navItems: defaultNavItems,
    isCollapsed: false,
    onToggleCollapse: vi.fn(),
    isMobileOpen: false,
    onCloseMobile: vi.fn(),
    onSignOut: vi.fn(),
    isSigningOut: false,
  },
};

function renderWithRouter(props: AppShellLayoutProps) {
  return render(
    <MemoryRouter initialEntries={['/app']}>
      <Routes>
        <Route path="/app" element={<AppShellLayout {...props} />}>
          <Route index element={<div>Test Content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('AppShellLayout — Header', () => {
  it('renders the Header component with the app name', () => {
    renderWithRouter(defaultProps);

    expect(screen.getByText('TaskOps')).toBeInTheDocument();
  });
});

describe('AppShellLayout — Sidebar', () => {
  it('renders the Sidebar component with nav items', () => {
    renderWithRouter(defaultProps);

    expect(screen.getByRole('link', { name: /tasks/i })).toBeInTheDocument();
  });
});

describe('AppShellLayout — Outlet', () => {
  it('renders child route content via Outlet', () => {
    renderWithRouter(defaultProps);

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});

describe('AppShellLayout — main element margin', () => {
  it('applies md:ml-56 to main when sidebar is expanded', () => {
    renderWithRouter(defaultProps);

    const main = screen.getByRole('main');

    expect(main).toHaveClass('md:ml-56');
  });

  it('applies md:ml-16 to main when sidebar is collapsed', () => {
    renderWithRouter({
      ...defaultProps,
      headerProps: { ...defaultProps.headerProps, isCollapsed: true },
      sidebarProps: { ...defaultProps.sidebarProps, isCollapsed: true },
    });

    const main = screen.getByRole('main');

    expect(main).toHaveClass('md:ml-16');
  });
});

describe('AppShellLayout — ParticleBackground', () => {
  it('renders ParticleBackground when animatedBackground is true', () => {
    renderWithRouter({ ...defaultProps, animatedBackground: true });

    expect(screen.getByTestId('particle-background')).toBeInTheDocument();
  });

  it('does not render ParticleBackground when animatedBackground is false', () => {
    renderWithRouter({ ...defaultProps, animatedBackground: false });

    expect(screen.queryByTestId('particle-background')).not.toBeInTheDocument();
  });

  it('does not render ParticleBackground by default', () => {
    renderWithRouter(defaultProps);

    expect(screen.queryByTestId('particle-background')).not.toBeInTheDocument();
  });
});

describe('AppShellLayout — DemoBanner', () => {
  it('renders DemoBanner when isDemoUser is true and onDemoSignUp is provided', () => {
    renderWithRouter({
      ...defaultProps,
      isDemoUser: true,
      onDemoSignUp: vi.fn(),
    });

    expect(screen.getByTestId('demo-banner')).toBeInTheDocument();
  });

  it('does not render DemoBanner when isDemoUser is false', () => {
    renderWithRouter({
      ...defaultProps,
      isDemoUser: false,
      onDemoSignUp: vi.fn(),
    });

    expect(screen.queryByTestId('demo-banner')).not.toBeInTheDocument();
  });

  it('does not render DemoBanner when onDemoSignUp is not provided', () => {
    renderWithRouter({
      ...defaultProps,
      isDemoUser: true,
    });

    expect(screen.queryByTestId('demo-banner')).not.toBeInTheDocument();
  });
});
