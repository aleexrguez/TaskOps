import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, beforeEach } from 'vitest';
import { useAppPreferencesStore } from '@/shared/store/app-preferences.store';
import { LanguageToggle } from '../LanguageToggle';

describe('LanguageToggle', () => {
  beforeEach(() => {
    useAppPreferencesStore.setState({ language: 'en' });
  });

  it('renders with current language label EN', () => {
    render(<LanguageToggle />);
    expect(screen.getByText('EN')).toBeInTheDocument();
  });

  it('toggles to ES on click', async () => {
    const user = userEvent.setup();
    render(<LanguageToggle />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('ES')).toBeInTheDocument();
  });

  it('toggles back to EN on second click', async () => {
    const user = userEvent.setup();
    render(<LanguageToggle />);
    await user.click(screen.getByRole('button'));
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('EN')).toBeInTheDocument();
  });
});
