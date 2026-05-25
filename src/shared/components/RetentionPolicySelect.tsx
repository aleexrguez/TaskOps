import { useTranslation } from 'react-i18next';
import type { RetentionPolicy } from '@/shared/types/preferences.types';

interface RetentionPolicySelectProps {
  id?: string;
  retentionPolicy: RetentionPolicy;
  onRetentionChange: (policy: RetentionPolicy) => void;
}

export function RetentionPolicySelect({
  id,
  retentionPolicy,
  onRetentionChange,
}: RetentionPolicySelectProps) {
  const { t } = useTranslation('settings');

  return (
    <select
      id={id}
      value={retentionPolicy}
      onChange={(e) => onRetentionChange(e.target.value as RetentionPolicy)}
      className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-offset-gray-800"
    >
      <option value="5d">{t('dataRetention.5d')}</option>
      <option value="7d">{t('dataRetention.7d')}</option>
      <option value="30d">{t('dataRetention.30d')}</option>
      <option value="never">{t('dataRetention.never')}</option>
    </select>
  );
}
