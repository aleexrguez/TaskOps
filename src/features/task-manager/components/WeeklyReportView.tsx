import { useTranslation } from 'react-i18next';
import type { WeeklyReportData } from '../types';
import { getTaskAge, formatDate } from '../utils';
import type { DateLang } from '../utils/date.utils';
import { ReportSummaryCards } from './ReportSummaryCards';
import { ReportTaskSection } from './ReportTaskSection';

interface WeeklyReportViewProps {
  report: WeeklyReportData;
}

export function WeeklyReportView({ report }: WeeklyReportViewProps) {
  const { t, i18n } = useTranslation('reports');
  const lang = (i18n.resolvedLanguage ?? 'en') as DateLang;

  const cards = [
    {
      label: t('card.completed'),
      value: report.summary.tasksCompleted,
      className:
        'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
    },
    {
      label: t('card.created'),
      value: report.summary.tasksCreated,
      className:
        'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
    },
    {
      label: t('card.inProgress'),
      value: report.summary.tasksInProgress,
      className:
        'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
    },
    {
      label: t('card.overdue'),
      value: report.summary.tasksOverdue,
      className:
        'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
    },
    {
      label: t('card.recurring'),
      value: report.summary.recurringTasksCompleted,
      className:
        'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800',
    },
    {
      label: t('card.checklist'),
      value: report.summary.checklistItemsCompleted,
      className:
        'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800',
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        {report.period.label}
      </h2>

      <ReportSummaryCards cards={cards} />

      <ReportTaskSection
        title={t('section.completedTasks')}
        emptyMessage={t('section.emptySection')}
        tasks={report.completedTasks}
        renderExtra={(task) =>
          task.completedAt ? (
            <span className="whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
              {formatDate(task.completedAt, lang)}
            </span>
          ) : null
        }
      />

      <ReportTaskSection
        title={t('section.createdThisWeek')}
        emptyMessage={t('section.emptySection')}
        tasks={report.createdTasks}
      />

      <ReportTaskSection
        title={t('section.stuck')}
        description={t('section.stuckDescWeekly')}
        emptyMessage={t('section.emptySection')}
        tasks={report.stuckTasks}
        renderExtra={(task) => (
          <span className="whitespace-nowrap text-xs text-amber-600 dark:text-amber-400">
            {t('inline.openForDays', { days: getTaskAge(task) })}
          </span>
        )}
      />

      <ReportTaskSection
        title={t('section.overdueTasks')}
        emptyMessage={t('section.emptySection')}
        tasks={report.overdueTasks}
        renderExtra={(task) =>
          task.dueDate ? (
            <span className="whitespace-nowrap text-xs text-red-600 dark:text-red-400">
              {t('inline.dueDate', { date: formatDate(task.dueDate, lang) })}
            </span>
          ) : null
        }
      />
    </div>
  );
}
