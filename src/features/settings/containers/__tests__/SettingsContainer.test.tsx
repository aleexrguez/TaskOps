import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useAppPreferencesStore } from '@/shared/store/app-preferences.store';
import { SettingsContainer } from '../SettingsContainer';

vi.mock('@/shared/store/app-preferences.store', () => ({
  useAppPreferencesStore: vi.fn(),
}));

const mockSetTheme = vi.fn();
const mockSetRetentionPolicy = vi.fn();
const mockToggleReminders = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();

  vi.mocked(useAppPreferencesStore).mockImplementation((selector) =>
    selector({
      theme: 'system',
      setTheme: mockSetTheme,
      retentionPolicy: 'never',
      setRetentionPolicy: mockSetRetentionPolicy,
      isSidebarCollapsed: false,
      toggleSidebar: vi.fn(),
      remindersEnabled: true,
      toggleReminders: mockToggleReminders,
      animatedBackground: false,
      toggleAnimatedBackground: vi.fn(),
    }),
  );
});

describe('SettingsContainer', () => {
  it('renders the Settings page heading', () => {
    render(<SettingsContainer />);

    expect(
      screen.getByRole('heading', { level: 1, name: /settings/i }),
    ).toBeInTheDocument();
  });

  it('renders theme radios from store state', () => {
    render(<SettingsContainer />);

    expect(screen.getByRole('radio', { name: /light/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /dark/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /system/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /system/i })).toBeChecked();
  });

  it('calls setTheme when a theme radio is clicked', async () => {
    const user = userEvent.setup();
    render(<SettingsContainer />);

    await user.click(screen.getByRole('radio', { name: /dark/i }));

    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('renders retention select with store value', () => {
    render(<SettingsContainer />);

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(select).toHaveValue('never');
  });

  it('calls setRetentionPolicy when retention is changed', async () => {
    const user = userEvent.setup();
    render(<SettingsContainer />);

    await user.selectOptions(screen.getByRole('combobox'), '7d');

    expect(mockSetRetentionPolicy).toHaveBeenCalledWith('7d');
  });

  it('renders reminders checkbox checked when store has remindersEnabled=true', () => {
    render(<SettingsContainer />);

    expect(
      screen.getByRole('checkbox', { name: /due date reminders/i }),
    ).toBeChecked();
  });

  it('calls toggleReminders from store when checkbox is clicked', async () => {
    const user = userEvent.setup();
    render(<SettingsContainer />);

    await user.click(
      screen.getByRole('checkbox', { name: /due date reminders/i }),
    );

    expect(mockToggleReminders).toHaveBeenCalledOnce();
  });
});
