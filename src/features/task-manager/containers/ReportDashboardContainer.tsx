import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useReport } from '../hooks/use-report';
import { activityKeys } from '../hooks/activity.keys';
import type {
  ReportPeriod,
  WeeklyReportData,
  MonthlyReportData,
} from '../types';
import { WeeklyReportView } from '../components/WeeklyReportView';
import { MonthlyReportView } from '../components/MonthlyReportView';
import { TaskErrorState } from '../components/TaskErrorState';

export function ReportDashboardContainer() {
  const [selectedPeriod, setSelectedPeriod] =
    useState<ReportPeriod>('this-week');
  const queryClient = useQueryClient();

  const { report, isLoading, isError } = useReport(selectedPeriod);

  const isWeekly =
    selectedPeriod === 'this-week' || selectedPeriod === 'last-week';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Reports
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Task activity summaries by period
          </p>
        </div>

        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value as ReportPeriod)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
        >
          <option value="this-week">This Week</option>
          <option value="last-week">Last Week</option>
          <option value="this-month">This Month</option>
          <option value="last-month">Last Month</option>
        </select>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading report...
          </p>
        </div>
      )}

      {isError && (
        <TaskErrorState
          message="Failed to load report data. Please try again."
          onRetry={() =>
            queryClient.refetchQueries({ queryKey: activityKeys.all })
          }
        />
      )}

      {!isLoading &&
        !isError &&
        report &&
        (isWeekly ? (
          <WeeklyReportView report={report as WeeklyReportData} />
        ) : (
          <MonthlyReportView report={report as MonthlyReportData} />
        ))}

      <p className="text-xs text-gray-400 dark:text-gray-500">
        Archived completed tasks are included. Purged tasks may be excluded.
      </p>
    </div>
  );
}
