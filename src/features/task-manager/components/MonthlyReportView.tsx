import type { MonthlyReportData } from '../types';
import { getTaskAge } from '../utils';
import { ReportSummaryCards } from './ReportSummaryCards';
import { ReportTaskSection } from './ReportTaskSection';

interface MonthlyReportViewProps {
  report: MonthlyReportData;
}

function formatDateShort(dateStr: string): string {
  const [, m, d] = dateStr.split('-');
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return `${months[Number(m) - 1]} ${Number(d)}`;
}

export function MonthlyReportView({ report }: MonthlyReportViewProps) {
  const cards = [
    {
      label: 'Completed',
      value: report.summary.tasksCompleted,
      className:
        'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
    },
    {
      label: 'Created',
      value: report.summary.tasksCreated,
      className:
        'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
    },
    {
      label: 'Recurring',
      value: report.summary.recurringTasksCompleted,
      className:
        'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800',
    },
    {
      label: 'Checklist',
      value: report.summary.checklistItemsCompleted,
      className:
        'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800',
    },
  ];

  const maxCount = Math.max(...report.completedByDay.map((d) => d.count), 0);
  const nonZeroDays = report.completedByDay.filter((d) => d.count > 0);

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        {report.period.label}
      </h2>

      <ReportSummaryCards cards={cards} />

      <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
        <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
          Completed by Day
        </h3>
        {nonZeroDays.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">
            No completions this month
          </p>
        ) : (
          <div className="space-y-1">
            {nonZeroDays.map((day) => {
              const pct = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
              return (
                <div key={day.date} className="flex items-center gap-2 text-xs">
                  <span className="w-20 shrink-0 text-gray-500 dark:text-gray-400">
                    {formatDateShort(day.date)}
                  </span>
                  <div className="flex-1">
                    <div
                      className="h-4 rounded bg-indigo-500 dark:bg-indigo-400"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-6 text-right font-medium text-gray-700 dark:text-gray-300">
                    {day.count}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
        <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
          Completed by Priority
        </h3>
        <div className="flex gap-4">
          {[
            {
              label: 'High',
              value: report.completedByPriority.high,
              dot: 'bg-red-500',
            },
            {
              label: 'Medium',
              value: report.completedByPriority.medium,
              dot: 'bg-yellow-500',
            },
            {
              label: 'Low',
              value: report.completedByPriority.low,
              dot: 'bg-green-500',
            },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5 text-sm">
              <span
                className={`h-2 w-2 rounded-full ${item.dot}`}
                aria-hidden="true"
              />
              <span className="text-gray-600 dark:text-gray-400">
                {item.label}:
              </span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <ReportTaskSection
        title="Longest Running Tasks"
        tasks={report.longestRunningTasks}
        renderExtra={(task) => (
          <span className="whitespace-nowrap text-xs text-amber-600 dark:text-amber-400">
            Open for {getTaskAge(task)} days
          </span>
        )}
      />

      <ReportTaskSection
        title="Stuck — Open for Many Days"
        description="In-progress tasks created more than 14 days ago"
        tasks={report.stuckTasks}
        renderExtra={(task) => (
          <span className="whitespace-nowrap text-xs text-amber-600 dark:text-amber-400">
            Open for {getTaskAge(task)} days
          </span>
        )}
      />
    </div>
  );
}
