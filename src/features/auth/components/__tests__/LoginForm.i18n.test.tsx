import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import i18n from '@/i18n/i18n';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginForm } from '../LoginForm';

describe('LoginForm — i18n', () => {
  beforeEach(() => {
    i18n.changeLanguage('en');
  });

  it('renders submit button in English', () => {
    render(
      <MemoryRouter>
        <LoginForm onSubmit={vi.fn()} isPending={false} error={null} />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole('button', { name: /sign in/i }),
    ).toBeInTheDocument();
  });

  it('renders submit button in Spanish', async () => {
    await i18n.changeLanguage('es');
    render(
      <MemoryRouter>
        <LoginForm onSubmit={vi.fn()} isPending={false} error={null} />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole('button', { name: /iniciar sesión/i }),
    ).toBeInTheDocument();
  });
});
