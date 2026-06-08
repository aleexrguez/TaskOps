import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
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
  it('always renders "Try live demo" link pointing to /demo', () => {
    render(<LandingPage />, { wrapper: createWrapper() });

    const link = screen.getByRole('link', { name: /try.*demo/i });
    expect(link).toHaveAttribute('href', '/demo');
  });
});
