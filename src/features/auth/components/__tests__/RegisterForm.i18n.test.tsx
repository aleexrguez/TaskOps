import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import i18n from '@/i18n/i18n';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RegisterForm } from '../RegisterForm';

describe('RegisterForm — i18n', () => {
  beforeEach(() => {
    i18n.changeLanguage('en');
  });

  it('renders submit button in English', () => {
    render(
      <MemoryRouter>
        <RegisterForm onSubmit={vi.fn()} isPending={false} error={null} />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole('button', { name: /create account/i }),
    ).toBeInTheDocument();
  });

  it('renders submit button in Spanish', async () => {
    await i18n.changeLanguage('es');
    render(
      <MemoryRouter>
        <RegisterForm onSubmit={vi.fn()} isPending={false} error={null} />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole('button', { name: /crear cuenta/i }),
    ).toBeInTheDocument();
  });
});
