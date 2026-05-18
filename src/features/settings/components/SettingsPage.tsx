import type {
  RetentionPolicy,
  ThemePreference,
} from '@/shared/types/preferences.types';
import { RetentionPolicySelect } from '@/shared/components/RetentionPolicySelect';
import { ThemeSelector } from './ThemeSelector';

interface SettingsPageProps {
  theme: ThemePreference;
  onThemeChange: (theme: ThemePreference) => void;
  retentionPolicy: RetentionPolicy;
  onRetentionPolicyChange: (policy: RetentionPolicy) => void;
  remindersEnabled: boolean;
  onToggleReminders: () => void;
  animatedBackground: boolean;
  onToggleAnimatedBackground: () => void;
}

const CARD = 'bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm';

export function SettingsPage({
  theme,
  onThemeChange,
  retentionPolicy,
  onRetentionPolicyChange,
  remindersEnabled,
  onToggleReminders,
  animatedBackground,
  onToggleAnimatedBackground,
}: SettingsPageProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        Settings
      </h1>

      {/* Section 1 — Appearance */}
      <section className={CARD}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Appearance
        </h2>
        <ThemeSelector theme={theme} onThemeChange={onThemeChange} />
        <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 cursor-pointer mt-4">
          <input
            type="checkbox"
            checked={animatedBackground}
            onChange={onToggleAnimatedBackground}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          Animated background
        </label>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Show subtle floating particles behind app content.
        </p>
      </section>

      {/* Section 2 — Data Retention */}
      <section className={CARD}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Data Retention
        </h2>
        <label
          htmlFor="retention-policy"
          className="flex flex-col gap-2 text-sm text-gray-700 dark:text-gray-300"
        >
          Automatically archive completed tasks after:
          <RetentionPolicySelect
            id="retention-policy"
            retentionPolicy={retentionPolicy}
            onRetentionChange={onRetentionPolicyChange}
          />
        </label>
      </section>

      {/* Section 3 — Notifications */}
      <section className={CARD}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Notifications
        </h2>
        <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={remindersEnabled}
            onChange={onToggleReminders}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          Due date reminders
        </label>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Show popup reminders for tasks that are overdue or due soon.
        </p>
      </section>
    </div>
  );
}
