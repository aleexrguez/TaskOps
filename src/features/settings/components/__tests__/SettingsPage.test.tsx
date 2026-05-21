import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type {
  Language,
  RetentionPolicy,
  ThemePreference,
} from '@/shared/types/preferences.types';
import { SettingsPage } from '../SettingsPage';

const defaultProps = {
  theme: 'system' as ThemePreference,
  onThemeChange: vi.fn(),
  retentionPolicy: 'never' as RetentionPolicy,
  onRetentionPolicyChange: vi.fn(),
  remindersEnabled: true,
  onToggleReminders: vi.fn(),
  animatedBackground: false,
  onToggleAnimatedBackground: vi.fn(),
  language: 'en' as Language,
  onLanguageChange: vi.fn(),
};

describe('SettingsPage', () => {
  it('renders the Settings heading', () => {
    render(<SettingsPage {...defaultProps} />);

    expect(
      screen.getByRole('heading', { level: 1, name: /settings/i }),
    ).toBeInTheDocument();
  });

  it('renders the Appearance section with ThemeSelector radios', () => {
    render(<SettingsPage {...defaultProps} />);

    expect(
      screen.getByRole('heading', { level: 2, name: /appearance/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /light/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /dark/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /system/i })).toBeInTheDocument();
  });

  it('renders the Data Retention section with label and select', () => {
    render(<SettingsPage {...defaultProps} />);

    expect(
      screen.getByRole('heading', { level: 2, name: /data retention/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/automatically archive completed tasks after/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('combobox', {
        name: /automatically archive completed tasks after/i,
      }),
    ).toBeInTheDocument();
  });

  it('renders the Notifications section heading', () => {
    render(<SettingsPage {...defaultProps} />);

    expect(
      screen.getByRole('heading', { level: 2, name: /notifications/i }),
    ).toBeInTheDocument();
  });

  it('renders the "Due date reminders" checkbox', () => {
    render(<SettingsPage {...defaultProps} />);

    expect(
      screen.getByRole('checkbox', { name: /due date reminders/i }),
    ).toBeInTheDocument();
  });

  it('checkbox is checked when remindersEnabled is true', () => {
    render(<SettingsPage {...defaultProps} remindersEnabled={true} />);

    expect(
      screen.getByRole('checkbox', { name: /due date reminders/i }),
    ).toBeChecked();
  });

  it('checkbox is unchecked when remindersEnabled is false', () => {
    render(<SettingsPage {...defaultProps} remindersEnabled={false} />);

    expect(
      screen.getByRole('checkbox', { name: /due date reminders/i }),
    ).not.toBeChecked();
  });

  it('calls onToggleReminders when checkbox is clicked', async () => {
    const user = userEvent.setup();
    const onToggleReminders = vi.fn();

    render(
      <SettingsPage {...defaultProps} onToggleReminders={onToggleReminders} />,
    );

    await user.click(
      screen.getByRole('checkbox', { name: /due date reminders/i }),
    );

    expect(onToggleReminders).toHaveBeenCalledOnce();
  });

  it('renders the description text about popup reminders', () => {
    render(<SettingsPage {...defaultProps} />);

    expect(
      screen.getByText(
        /show popup reminders for tasks that are overdue or due soon/i,
      ),
    ).toBeInTheDocument();
  });

  it('renders the "Animated background" checkbox', () => {
    render(<SettingsPage {...defaultProps} />);

    expect(
      screen.getByRole('checkbox', { name: /animated background/i }),
    ).toBeInTheDocument();
  });

  it('animated background checkbox is checked when animatedBackground is true', () => {
    render(<SettingsPage {...defaultProps} animatedBackground={true} />);

    expect(
      screen.getByRole('checkbox', { name: /animated background/i }),
    ).toBeChecked();
  });

  it('animated background checkbox is unchecked when animatedBackground is false', () => {
    render(<SettingsPage {...defaultProps} animatedBackground={false} />);

    expect(
      screen.getByRole('checkbox', { name: /animated background/i }),
    ).not.toBeChecked();
  });

  it('calls onToggleAnimatedBackground when checkbox is clicked', async () => {
    const user = userEvent.setup();
    const onToggleAnimatedBackground = vi.fn();

    render(
      <SettingsPage
        {...defaultProps}
        onToggleAnimatedBackground={onToggleAnimatedBackground}
      />,
    );

    await user.click(
      screen.getByRole('checkbox', { name: /animated background/i }),
    );

    expect(onToggleAnimatedBackground).toHaveBeenCalledOnce();
  });

  it('renders the description text about floating particles', () => {
    render(<SettingsPage {...defaultProps} />);

    expect(
      screen.getByText(/show subtle floating particles behind app content/i),
    ).toBeInTheDocument();
  });

  it('renders the Language section with a select dropdown', () => {
    render(<SettingsPage {...defaultProps} />);

    expect(
      screen.getByRole('heading', { level: 2, name: /language/i }),
    ).toBeInTheDocument();
    const select = screen.getByRole('combobox', { name: /display language/i });
    expect(select).toBeInTheDocument();
    expect(select).toHaveValue('en');
  });

  it('calls onLanguageChange when a language option is selected', async () => {
    const user = userEvent.setup();
    const onLanguageChange = vi.fn();

    render(
      <SettingsPage {...defaultProps} onLanguageChange={onLanguageChange} />,
    );

    await user.selectOptions(
      screen.getByRole('combobox', { name: /display language/i }),
      'es',
    );

    expect(onLanguageChange).toHaveBeenCalledWith('es');
  });

  it('does not render Account or Change Password sections', () => {
    render(<SettingsPage {...defaultProps} />);

    expect(
      screen.queryByRole('heading', { level: 2, name: /account/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { level: 2, name: /change password/i }),
    ).not.toBeInTheDocument();
  });
});
