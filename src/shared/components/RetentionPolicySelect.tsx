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
  return (
    <select
      id={id}
      value={retentionPolicy}
      onChange={(e) => onRetentionChange(e.target.value as RetentionPolicy)}
      className="rounded-md border border-gray-200 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-800"
    >
      <option value="5d">5 days</option>
      <option value="7d">7 days</option>
      <option value="30d">30 days</option>
      <option value="never">Never</option>
    </select>
  );
}
