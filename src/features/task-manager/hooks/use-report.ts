import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchActivityEventsByDateRange } from '../api';
import { useAuth } from '@/features/auth/hooks';
import { useTasks } from './use-tasks';
import { activityKeys } from './activity.keys';
import {
  getDateRangeForPeriod,
  buildWeeklyReport,
  buildMonthlyReport,
} from '../utils';
import type {
  ReportPeriod,
  WeeklyReportData,
  MonthlyReportData,
} from '../types';

export function useReport(period: ReportPeriod) {
  const { user } = useAuth();
  const dateRange = useMemo(() => getDateRangeForPeriod(period), [period]);

  // Convert local boundaries to UTC ISO for Supabase (TIMESTAMPTZ column).
  // dateRange.startIso/endIso are local (no Z) — safe for JS Date comparisons
  // in utils, but Supabase interprets bare timestamps as its session TZ (UTC).
  const dbRange = useMemo(
    () => ({
      start: new Date(dateRange.startIso).toISOString(),
      end: new Date(dateRange.endIso).toISOString(),
    }),
    [dateRange],
  );

  const { data: tasksData, isLoading: tasksLoading } = useTasks();

  const {
    data: events,
    isLoading: eventsLoading,
    isError,
  } = useQuery({
    queryKey: activityKeys.dateRange(dbRange.start, dbRange.end),
    queryFn: () => fetchActivityEventsByDateRange(dbRange.start, dbRange.end),
    enabled: !!user,
    staleTime: 60_000,
  });

  const isWeekly = period === 'this-week' || period === 'last-week';

  const report = useMemo((): WeeklyReportData | MonthlyReportData | null => {
    if (!tasksData?.tasks || !events) return null;
    return isWeekly
      ? buildWeeklyReport(tasksData.tasks, events, dateRange)
      : buildMonthlyReport(tasksData.tasks, events, dateRange);
  }, [tasksData, events, dateRange, isWeekly]);

  return {
    report,
    isLoading: tasksLoading || eventsLoading,
    isError,
    dateRange,
  };
}
