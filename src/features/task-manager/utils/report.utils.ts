import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subWeeks,
  subMonths,
  format,
  differenceInDays,
  parseISO,
  eachDayOfInterval,
} from 'date-fns';
import type { Task } from '../types/task.types';
import type { ActivityEvent, ActivityEventType } from '../types/activity.types';
import type {
  ReportPeriod,
  DateRange,
  WeeklyReportData,
  MonthlyReportData,
} from '../types/report.types';

export const WEEKLY_STUCK_THRESHOLD_DAYS = 7;
export const MONTHLY_STUCK_THRESHOLD_DAYS = 14;
export const LONGEST_RUNNING_LIMIT = 5;

function toLocalIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  const ms = String(date.getMilliseconds()).padStart(3, '0');
  return `${y}-${m}-${d}T${h}:${min}:${s}.${ms}`;
}

export function getDateRangeForPeriod(
  period: ReportPeriod,
  now: Date = new Date(),
): DateRange {
  let startDate: Date;
  let endDate: Date;

  if (period === 'this-week') {
    startDate = startOfWeek(now, { weekStartsOn: 1 });
    endDate = endOfWeek(now, { weekStartsOn: 1 });
  } else if (period === 'last-week') {
    const lastWeek = subWeeks(now, 1);
    startDate = startOfWeek(lastWeek, { weekStartsOn: 1 });
    endDate = endOfWeek(lastWeek, { weekStartsOn: 1 });
  } else if (period === 'this-month') {
    startDate = startOfMonth(now);
    endDate = endOfMonth(now);
  } else {
    const lastMonth = subMonths(now, 1);
    startDate = startOfMonth(lastMonth);
    endDate = endOfMonth(lastMonth);
  }

  const startNormalized = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate(),
    0,
    0,
    0,
    0,
  );

  const endNormalized = new Date(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate(),
    23,
    59,
    59,
    999,
  );

  const startLabel = format(startNormalized, 'MMM d');
  const endLabel = format(endNormalized, 'MMM d, yyyy');
  const label = `${startLabel} – ${endLabel}`;

  return {
    startIso: toLocalIso(startNormalized),
    endIso: toLocalIso(endNormalized),
    label,
  };
}

export function isInDateRange(isoDatetime: string, range: DateRange): boolean {
  const ts = new Date(isoDatetime).getTime();
  const start = new Date(range.startIso).getTime();
  const end = new Date(range.endIso).getTime();
  return ts >= start && ts <= end;
}

export function getStuckTasks(
  tasks: Task[],
  thresholdDays: number,
  now: Date = new Date(),
): Task[] {
  return tasks
    .filter(
      (t) =>
        t.status === 'in-progress' &&
        differenceInDays(now, parseISO(t.createdAt)) > thresholdDays,
    )
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function getLongestRunningTasks(
  tasks: Task[],
  limit: number = LONGEST_RUNNING_LIMIT,
): Task[] {
  return tasks
    .filter((t) => t.status === 'in-progress')
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .slice(0, limit);
}

export function getOverdueTasks(tasks: Task[], now: Date = new Date()): Task[] {
  const todayStr = format(now, 'yyyy-MM-dd');
  return tasks.filter(
    (t) =>
      t.status !== 'done' && t.dueDate !== undefined && t.dueDate < todayStr,
  );
}

export function getTaskAge(task: Task, now: Date = new Date()): number {
  return differenceInDays(now, parseISO(task.createdAt));
}

export function countEventsByType(
  events: ActivityEvent[],
  type: ActivityEventType,
): number {
  return events.filter((e) => e.eventType === type).length;
}

export function countCompletedByDay(
  completedTasks: Task[],
  range: DateRange,
): { date: string; count: number }[] {
  const counts = new Map<string, number>();

  for (const task of completedTasks) {
    if (task.completedAt === undefined) continue;
    const date = task.completedAt.slice(0, 10);
    counts.set(date, (counts.get(date) ?? 0) + 1);
  }

  const startDate = new Date(
    Number(range.startIso.slice(0, 4)),
    Number(range.startIso.slice(5, 7)) - 1,
    Number(range.startIso.slice(8, 10)),
  );
  const endDate = new Date(
    Number(range.endIso.slice(0, 4)),
    Number(range.endIso.slice(5, 7)) - 1,
    Number(range.endIso.slice(8, 10)),
  );

  const allDays = eachDayOfInterval({ start: startDate, end: endDate });

  return allDays.map((day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return { date: dateStr, count: counts.get(dateStr) ?? 0 };
  });
}

export function countCompletedByPriority(tasks: Task[]): {
  high: number;
  medium: number;
  low: number;
} {
  return {
    high: tasks.filter((t) => t.priority === 'high').length,
    medium: tasks.filter((t) => t.priority === 'medium').length,
    low: tasks.filter((t) => t.priority === 'low').length,
  };
}

export function buildWeeklyReport(
  tasks: Task[],
  events: ActivityEvent[],
  range: DateRange,
  now: Date = new Date(),
): WeeklyReportData {
  const completedTasks = tasks.filter(
    (t) => t.completedAt !== undefined && isInDateRange(t.completedAt, range),
  );
  const createdTasks = tasks.filter((t) => isInDateRange(t.createdAt, range));
  const stuckTasks = getStuckTasks(tasks, WEEKLY_STUCK_THRESHOLD_DAYS, now);
  const overdueTasks = getOverdueTasks(tasks, now);

  return {
    period: range,
    summary: {
      tasksCompleted: completedTasks.length,
      tasksCreated: createdTasks.length,
      tasksInProgress: tasks.filter((t) => t.status === 'in-progress').length,
      tasksOverdue: overdueTasks.length,
      checklistItemsCompleted: countEventsByType(
        events,
        'checklist_item_completed',
      ),
      recurringTasksCompleted: completedTasks.filter(
        (t) => t.recurrenceTemplateId !== undefined,
      ).length,
    },
    completedTasks,
    createdTasks,
    stuckTasks,
    overdueTasks,
  };
}

export function buildMonthlyReport(
  tasks: Task[],
  events: ActivityEvent[],
  range: DateRange,
  now: Date = new Date(),
): MonthlyReportData {
  const completedTasks = tasks.filter(
    (t) => t.completedAt !== undefined && isInDateRange(t.completedAt, range),
  );
  const createdTasks = tasks.filter((t) => isInDateRange(t.createdAt, range));
  const stuckTasks = getStuckTasks(tasks, MONTHLY_STUCK_THRESHOLD_DAYS, now);
  const longestRunningTasks = getLongestRunningTasks(tasks);

  return {
    period: range,
    summary: {
      tasksCompleted: completedTasks.length,
      tasksCreated: createdTasks.length,
      checklistItemsCompleted: countEventsByType(
        events,
        'checklist_item_completed',
      ),
      recurringTasksCompleted: completedTasks.filter(
        (t) => t.recurrenceTemplateId !== undefined,
      ).length,
    },
    stuckTasks,
    longestRunningTasks,
    completedByDay: countCompletedByDay(completedTasks, range),
    completedByPriority: countCompletedByPriority(completedTasks),
  };
}
