import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type {
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
    expect(screen.getByRole('combobox')).toBeInTheDocument();
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
