import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/features/auth/hooks', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/shared/hooks/use-is-demo-user', () => ({
  useIsDemoUser: vi.fn(),
}));

vi.mock('@/features/auth/api', () => ({
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('@/shared/hooks/use-apply-theme', () => ({
  useApplyTheme: vi.fn(),
}));

const mockNavigate = vi.fn();
const mockNavigateComponent = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(() => mockNavigate),
    Navigate: vi.fn((props) => {
      mockNavigateComponent(props);
      return null;
    }),
  };
});

import { useAuth } from '@/features/auth/hooks';
import { useIsDemoUser } from '@/shared/hooks/use-is-demo-user';
import { signIn, signOut } from '@/features/auth/api';
import { DemoLoginContainer } from '../DemoLoginContainer';

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;
const mockUseIsDemoUser = useIsDemoUser as ReturnType<typeof vi.fn>;
const mockSignIn = signIn as ReturnType<typeof vi.fn>;
const mockSignOut = signOut as ReturnType<typeof vi.fn>;

function renderContainer() {
  return render(
    <MemoryRouter>
      <DemoLoginContainer />
    </MemoryRouter>,
  );
}

describe('DemoLoginContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('VITE_DEMO_EMAIL', 'demo@test.com');
    vi.stubEnv('VITE_DEMO_PASSWORD', 'demo123');
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      isLoading: false,
    });
    mockUseIsDemoUser.mockReturnValue(false);
    mockSignIn.mockResolvedValue(undefined);
    mockSignOut.mockResolvedValue(undefined);
  });

  describe('loading state', () => {
    it('renders spinner while auth is loading', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        session: null,
        isLoading: true,
      });

      renderContainer();

      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('auto-login flow', () => {
    it('calls signIn with env var credentials when no user', async () => {
      renderContainer();

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('demo@test.com', 'demo123');
      });
    });

    it('navigates to /app with replace after successful signIn', async () => {
      renderContainer();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/app', { replace: true });
      });
    });

    it('shows error state when signIn throws', async () => {
      mockSignIn.mockRejectedValue(new Error('Invalid credentials'));

      renderContainer();

      await waitFor(() => {
        expect(
          screen.getByText(/could not load the demo/i),
        ).toBeInTheDocument();
      });

      expect(
        screen.getByRole('link', { name: /create account/i }),
      ).toHaveAttribute('href', '/register');
      expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute(
        'href',
        '/login',
      );
    });
  });

  describe('already demo user', () => {
    it('renders Navigate to /app when user is the demo user', () => {
      mockUseAuth.mockReturnValue({
        user: { id: '1', email: 'demo@test.com' },
        session: {},
        isLoading: false,
      });
      mockUseIsDemoUser.mockReturnValue(true);

      renderContainer();

      expect(mockNavigateComponent).toHaveBeenCalledWith(
        expect.objectContaining({ to: '/app', replace: true }),
      );
    });
  });

  describe('already signed in as normal user', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { id: '2', email: 'user@example.com' },
        session: {},
        isLoading: false,
      });
      mockUseIsDemoUser.mockReturnValue(false);
    });

    it('shows "already signed in" heading', () => {
      renderContainer();

      expect(screen.getByText(/you're already signed in/i)).toBeInTheDocument();
    });

    it('renders "Continue to app" button that navigates to /app', async () => {
      const user = userEvent.setup();
      renderContainer();

      await user.click(
        screen.getByRole('button', { name: /continue to app/i }),
      );

      expect(mockNavigate).toHaveBeenCalledWith('/app');
    });

    it('renders "Sign out and try demo" button', () => {
      renderContainer();

      expect(
        screen.getByRole('button', { name: /sign out and try demo/i }),
      ).toBeInTheDocument();
    });

    it('renders "Back to home" button that navigates to /', async () => {
      const user = userEvent.setup();
      renderContainer();

      await user.click(screen.getByRole('button', { name: /back to home/i }));

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('calls signOut then signIn when "Sign out and try demo" is clicked', async () => {
      const user = userEvent.setup();
      renderContainer();

      await user.click(
        screen.getByRole('button', { name: /sign out and try demo/i }),
      );

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalledTimes(1);
        expect(mockSignIn).toHaveBeenCalledWith('demo@test.com', 'demo123');
      });
    });

    it('navigates to /app after sign out and demo login succeed', async () => {
      const user = userEvent.setup();
      renderContainer();

      await user.click(
        screen.getByRole('button', { name: /sign out and try demo/i }),
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/app', { replace: true });
      });
    });
  });

  describe('missing env vars', () => {
    it('shows error state immediately when VITE_DEMO_EMAIL is undefined', async () => {
      vi.stubEnv('VITE_DEMO_EMAIL', '');

      renderContainer();

      await waitFor(() => {
        expect(
          screen.getByText(/could not load the demo/i),
        ).toBeInTheDocument();
      });

      expect(mockSignIn).not.toHaveBeenCalled();
    });
  });
});
