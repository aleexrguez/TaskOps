import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import i18n from '@/i18n/i18n';
import { beforeEach, describe, expect, it } from 'vitest';
import { Footer } from '../Footer';

function renderFooter() {
  return render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>,
  );
}

describe('Footer', () => {
  beforeEach(() => {
    i18n.changeLanguage('en');
  });

  it('renders all four legal links with correct hrefs', () => {
    renderFooter();

    const privacyLink = screen.getByRole('link', { name: /privacy policy/i });
    const termsLink = screen.getByRole('link', { name: /terms of service/i });
    const cookiesLink = screen.getByRole('link', { name: /cookie policy/i });
    const legalLink = screen.getByRole('link', { name: /legal notice/i });

    expect(privacyLink).toHaveAttribute('href', '/privacy');
    expect(termsLink).toHaveAttribute('href', '/terms');
    expect(cookiesLink).toHaveAttribute('href', '/cookies');
    expect(legalLink).toHaveAttribute('href', '/legal');
  });

  it('renders copyright text', () => {
    renderFooter();
    expect(screen.getByText(/TaskOps/)).toBeInTheDocument();
  });

  it('renders links in Spanish when language is ES', async () => {
    await i18n.changeLanguage('es');
    renderFooter();

    expect(
      screen.getByRole('link', { name: /privacidad/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /términos de servicio/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /política de cookies/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /aviso legal/i }),
    ).toBeInTheDocument();
  });
});
