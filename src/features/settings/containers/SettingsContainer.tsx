import { useAppPreferencesStore } from '@/shared/store/app-preferences.store';
import { SettingsPage } from '../components/SettingsPage';

export function SettingsContainer() {
  const theme = useAppPreferencesStore((s) => s.theme);
  const setTheme = useAppPreferencesStore((s) => s.setTheme);
  const retentionPolicy = useAppPreferencesStore((s) => s.retentionPolicy);
  const setRetentionPolicy = useAppPreferencesStore(
    (s) => s.setRetentionPolicy,
  );
  const remindersEnabled = useAppPreferencesStore((s) => s.remindersEnabled);
  const toggleReminders = useAppPreferencesStore((s) => s.toggleReminders);

  return (
    <SettingsPage
      theme={theme}
      onThemeChange={setTheme}
      retentionPolicy={retentionPolicy}
      onRetentionPolicyChange={setRetentionPolicy}
      remindersEnabled={remindersEnabled}
      onToggleReminders={toggleReminders}
    />
  );
}
