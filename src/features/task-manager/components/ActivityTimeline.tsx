import { formatDistanceToNow, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { formatEventDescription } from '../utils/activity.utils';
import { formatDateTime, getDateLocale } from '../utils/date.utils';
import type { DateLang } from '../utils/date.utils';
import type { ActivityEvent } from '../types/activity.types';

interface ActivityTimelineProps {
  events: ActivityEvent[];
  isLoading?: boolean;
}

export function ActivityTimeline({ events, isLoading }: ActivityTimelineProps) {
  const { t, i18n } = useTranslation('task');
  const lang = (i18n.resolvedLanguage ?? 'en') as DateLang;
  const heading = t('activity.heading');

  if (isLoading) {
    return (
      <section aria-label={heading}>
        <h2 className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
          {heading}
        </h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-3 animate-pulse">
              <div className="mt-1 h-2 w-2 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="flex-1 space-y-1">
                <div className="h-3 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-2.5 w-1/4 rounded bg-gray-100 dark:bg-gray-800" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (events.length === 0) {
    return (
      <section aria-label={heading}>
        <h2 className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
          {heading}
        </h2>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {t('activity.empty')}
        </p>
      </section>
    );
  }

  return (
    <section aria-label={heading}>
      <h2 className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
        {heading}
      </h2>
      <ul className="space-y-2 border-l border-gray-200 pl-4 dark:border-gray-700">
        {events.map((event) => (
          <li key={event.id} className="relative flex items-start gap-2">
            <span
              className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600"
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-600 dark:text-gray-300">
                {formatEventDescription(event, t, lang)}
              </p>
              <time
                dateTime={event.createdAt}
                className="text-[11px] text-gray-400 dark:text-gray-500"
                title={formatDateTime(event.createdAt, lang)}
              >
                {formatDistanceToNow(parseISO(event.createdAt), {
                  addSuffix: true,
                  locale: getDateLocale(lang),
                })}
              </time>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
