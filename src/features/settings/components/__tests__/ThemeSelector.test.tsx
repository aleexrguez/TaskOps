import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ThemeSelector } from '../ThemeSelector';

describe('ThemeSelector', () => {
  it('renders 3 radio buttons: Light, Dark, System', () => {
    render(<ThemeSelector theme="light" onThemeChange={vi.fn()} />);

    expect(screen.getByRole('radio', { name: /light/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /dark/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /system/i })).toBeInTheDocument();
  });

  it('checks the radio matching the current theme prop', () => {
    render(<ThemeSelector theme="dark" onThemeChange={vi.fn()} />);

    expect(screen.getByRole('radio', { name: /dark/i })).toBeChecked();
    expect(screen.getByRole('radio', { name: /light/i })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: /system/i })).not.toBeChecked();
  });

  it('calls onThemeChange with "dark" when Dark radio is clicked', async () => {
    const user = userEvent.setup();
    const onThemeChange = vi.fn();

    render(<ThemeSelector theme="light" onThemeChange={onThemeChange} />);

    await user.click(screen.getByRole('radio', { name: /dark/i }));

    expect(onThemeChange).toHaveBeenCalledOnce();
    expect(onThemeChange).toHaveBeenCalledWith('dark');
  });

  it('calls onThemeChange with "system" when System radio is clicked', async () => {
    const user = userEvent.setup();
    const onThemeChange = vi.fn();

    render(<ThemeSelector theme="light" onThemeChange={onThemeChange} />);

    await user.click(screen.getByRole('radio', { name: /system/i }));

    expect(onThemeChange).toHaveBeenCalledOnce();
    expect(onThemeChange).toHaveBeenCalledWith('system');
  });

  it('all radios share the name "theme"', () => {
    render(<ThemeSelector theme="system" onThemeChange={vi.fn()} />);

    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(3);
    radios.forEach((radio) => {
      expect(radio).toHaveAttribute('name', 'theme');
    });
  });
});
