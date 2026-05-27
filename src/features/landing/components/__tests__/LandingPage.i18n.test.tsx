import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import i18n from '@/i18n/i18n';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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

describe('LandingPage — i18n', () => {
  beforeEach(() => {
    i18n.changeLanguage('en');
  });

  it('renders hero title in English by default', () => {
    render(<LandingPage />, { wrapper: createWrapper() });
    expect(screen.getByText('Ship Work, Not Chaos')).toBeInTheDocument();
  });

  it('renders hero title in Spanish when language is es', async () => {
    await i18n.changeLanguage('es');
    render(<LandingPage />, { wrapper: createWrapper() });
    expect(
      screen.getByText('Organiza el trabajo, no el caos'),
    ).toBeInTheDocument();
  });
});
