import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { LandingPage } from '../LandingPage';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };
}

vi.mock('@/shared/hooks/use-apply-theme', () => ({
  useApplyTheme: vi.fn(),
}));

describe('LandingPage — demo CTA', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_DEMO_EMAIL', 'demo@test.com');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('renders "Try live demo" link pointing to /demo when VITE_DEMO_EMAIL is set', () => {
    render(<LandingPage />, { wrapper: createWrapper() });

    const link = screen.getByRole('link', { name: /try.*demo/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/demo');
  });
});

describe('LandingPage — demo CTA hidden', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_DEMO_EMAIL', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('does not render "Try live demo" link when VITE_DEMO_EMAIL is not set', () => {
    render(<LandingPage />, { wrapper: createWrapper() });

    expect(
      screen.queryByRole('link', { name: /try.*demo/i }),
    ).not.toBeInTheDocument();
  });
});
