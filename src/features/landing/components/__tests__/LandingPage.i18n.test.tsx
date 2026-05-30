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
    expect(
      screen.getByText('Modern Productivity Without Enterprise Complexity'),
    ).toBeInTheDocument();
  });

  it('renders hero title in Spanish when language is es', async () => {
    await i18n.changeLanguage('es');
    render(<LandingPage />, { wrapper: createWrapper() });
    expect(
      screen.getByText('Productividad moderna, sin complejidad innecesaria'),
    ).toBeInTheDocument();
  });

  it('renders new sections headings in English', () => {
    render(<LandingPage />, { wrapper: createWrapper() });
    expect(screen.getByText('Built and shipping')).toBeInTheDocument();
    expect(screen.getByText("What's next")).toBeInTheDocument();
    expect(screen.getByText('Built with modern tools')).toBeInTheDocument();
  });

  it('renders new sections headings in Spanish', async () => {
    await i18n.changeLanguage('es');
    render(<LandingPage />, { wrapper: createWrapper() });
    expect(screen.getByText('Construido y en producción')).toBeInTheDocument();
    expect(screen.getByText('Qué viene')).toBeInTheDocument();
    expect(
      screen.getByText('Construido con herramientas modernas'),
    ).toBeInTheDocument();
  });

  it('renders new feature cards in English', () => {
    render(<LandingPage />, { wrapper: createWrapper() });
    expect(screen.getByText('Inbox Capture')).toBeInTheDocument();
    expect(screen.getByText('Weekly & Monthly Reports')).toBeInTheDocument();
  });

  it('renders new feature cards in Spanish', async () => {
    await i18n.changeLanguage('es');
    render(<LandingPage />, { wrapper: createWrapper() });
    expect(screen.getByText('Captura rápida')).toBeInTheDocument();
    expect(
      screen.getAllByText('Reportes semanales y mensuales').length,
    ).toBeGreaterThanOrEqual(1);
  });
});
