import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import i18n from '@/i18n/i18n';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrivacyPage } from '../PrivacyPage';
import { TermsPage } from '../TermsPage';
import { CookiesPage } from '../CookiesPage';
import { LegalNoticePage } from '../LegalNoticePage';

vi.mock('@/shared/hooks/use-apply-theme', () => ({
  useApplyTheme: vi.fn(),
}));

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('Legal Pages — render + i18n', () => {
  beforeEach(() => {
    i18n.changeLanguage('en');
  });

  describe('PrivacyPage', () => {
    it('renders title in English', () => {
      renderWithRouter(<PrivacyPage />);
      expect(
        screen.getByRole('heading', { level: 1, name: /privacy policy/i }),
      ).toBeInTheDocument();
    });

    it('renders title in Spanish', async () => {
      await i18n.changeLanguage('es');
      renderWithRouter(<PrivacyPage />);
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: /política de privacidad/i,
        }),
      ).toBeInTheDocument();
    });

    it('renders all sections', () => {
      renderWithRouter(<PrivacyPage />);
      expect(screen.getByText(/information we collect/i)).toBeInTheDocument();
      expect(
        screen.getByText(/how we use your information/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/third-party services/i)).toBeInTheDocument();
      expect(screen.getByText(/data storage/i)).toBeInTheDocument();
      expect(screen.getByText(/your rights/i)).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { level: 2, name: /contact/i }),
      ).toBeInTheDocument();
    });
  });

  describe('TermsPage', () => {
    it('renders title in English', () => {
      renderWithRouter(<TermsPage />);
      expect(
        screen.getByRole('heading', { level: 1, name: /terms of service/i }),
      ).toBeInTheDocument();
    });

    it('renders title in Spanish', async () => {
      await i18n.changeLanguage('es');
      renderWithRouter(<TermsPage />);
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: /términos de servicio/i,
        }),
      ).toBeInTheDocument();
    });
  });

  describe('CookiesPage', () => {
    it('renders title in English', () => {
      renderWithRouter(<CookiesPage />);
      expect(
        screen.getByRole('heading', { level: 1, name: /cookie policy/i }),
      ).toBeInTheDocument();
    });

    it('renders title in Spanish', async () => {
      await i18n.changeLanguage('es');
      renderWithRouter(<CookiesPage />);
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: /política de cookies/i,
        }),
      ).toBeInTheDocument();
    });
  });

  describe('LegalNoticePage', () => {
    it('renders title in English', () => {
      renderWithRouter(<LegalNoticePage />);
      expect(
        screen.getByRole('heading', { level: 1, name: /legal notice/i }),
      ).toBeInTheDocument();
    });

    it('renders title in Spanish', async () => {
      await i18n.changeLanguage('es');
      renderWithRouter(<LegalNoticePage />);
      expect(
        screen.getByRole('heading', { level: 1, name: /aviso legal/i }),
      ).toBeInTheDocument();
    });

    it('renders operator name and pending contact', () => {
      renderWithRouter(<LegalNoticePage />);
      expect(screen.getByText(/operated by taskops/i)).toBeInTheDocument();
      expect(
        screen.getByText(/contact information will be provided/i),
      ).toBeInTheDocument();
    });
  });

  it('all pages render footer with legal links', () => {
    renderWithRouter(<PrivacyPage />);
    expect(
      screen.getByRole('link', { name: /privacy policy/i }),
    ).toHaveAttribute('href', '/privacy');
    expect(
      screen.getByRole('link', { name: /terms of service/i }),
    ).toHaveAttribute('href', '/terms');
    expect(
      screen.getByRole('link', { name: /cookie policy/i }),
    ).toHaveAttribute('href', '/cookies');
    expect(screen.getByRole('link', { name: /legal notice/i })).toHaveAttribute(
      'href',
      '/legal',
    );
  });
});
