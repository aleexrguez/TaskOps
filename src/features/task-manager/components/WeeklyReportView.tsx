import type { WeeklyReportData } from '../types';
import { getTaskAge, formatDate } from '../utils';
import { ReportSummaryCards } from './ReportSummaryCards';
import { ReportTaskSection } from './ReportTaskSection';

interface WeeklyReportViewProps {
  report: WeeklyReportData;
}

export function WeeklyReportView({ report }: WeeklyReportViewProps) {
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
      label: 'In Progress',
      value: report.summary.tasksInProgress,
      className:
        'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
    },
    {
      label: 'Overdue',
      value: report.summary.tasksOverdue,
      className:
        'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
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

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        {report.period.label}
      </h2>

      <ReportSummaryCards cards={cards} />

      <ReportTaskSection
        title="Completed Tasks"
        tasks={report.completedTasks}
        renderExtra={(task) =>
          task.completedAt ? (
            <span className="whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
              {formatDate(task.completedAt)}
            </span>
          ) : null
        }
      />

      <ReportTaskSection
        title="Created This Week"
        tasks={report.createdTasks}
      />

      <ReportTaskSection
        title="Stuck — Open for Many Days"
        description="In-progress tasks created more than 7 days ago"
        tasks={report.stuckTasks}
        renderExtra={(task) => (
          <span className="whitespace-nowrap text-xs text-amber-600 dark:text-amber-400">
            Open for {getTaskAge(task)} days
          </span>
        )}
      />

      <ReportTaskSection
        title="Overdue Tasks"
        tasks={report.overdueTasks}
        renderExtra={(task) =>
          task.dueDate ? (
            <span className="whitespace-nowrap text-xs text-red-600 dark:text-red-400">
              Due {formatDate(task.dueDate)}
            </span>
          ) : null
        }
      />
    </div>
  );
}
