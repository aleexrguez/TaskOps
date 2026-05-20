import { useTranslation } from 'react-i18next';
import type { TaskStatus } from '../types';
import { STATUS_I18N_KEYS, STATUS_STYLES } from './status.constants';

interface StatusBadgeProps {
  status: TaskStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation('common');

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {t(STATUS_I18N_KEYS[status])}
    </span>
  );
}
