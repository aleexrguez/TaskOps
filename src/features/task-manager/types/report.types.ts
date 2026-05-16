import { z } from 'zod';
import { taskSchema } from './task.types';

export const reportPeriodSchema = z.enum([
  'this-week',
  'last-week',
  'this-month',
  'last-month',
]);
export type ReportPeriod = z.infer<typeof reportPeriodSchema>;

export const dateRangeSchema = z.object({
  startIso: z.string(), // ISO timestamp: local midnight, e.g. "2026-05-11T00:00:00.000"
  endIso: z.string(), // ISO timestamp: local end of day, e.g. "2026-05-17T23:59:59.999"
  label: z.string(), // Display label, e.g. "May 11 – May 17, 2026"
});
export type DateRange = z.infer<typeof dateRangeSchema>;

// Weekly report
export const weeklyReportSummarySchema = z.object({
  tasksCompleted: z.number(),
  tasksCreated: z.number(),
  tasksInProgress: z.number(),
  tasksOverdue: z.number(),
  checklistItemsCompleted: z.number(),
  recurringTasksCompleted: z.number(),
});

export const weeklyReportDataSchema = z.object({
  period: dateRangeSchema,
  summary: weeklyReportSummarySchema,
  completedTasks: z.array(taskSchema),
  createdTasks: z.array(taskSchema),
  stuckTasks: z.array(taskSchema),
  overdueTasks: z.array(taskSchema),
});
export type WeeklyReportData = z.infer<typeof weeklyReportDataSchema>;

// Monthly report
export const monthlyReportSummarySchema = z.object({
  tasksCompleted: z.number(),
  tasksCreated: z.number(),
  checklistItemsCompleted: z.number(),
  recurringTasksCompleted: z.number(),
});

export const completedByDayEntrySchema = z.object({
  date: z.string(),
  count: z.number(),
});

export const completedByPrioritySchema = z.object({
  high: z.number(),
  medium: z.number(),
  low: z.number(),
});

export const monthlyReportDataSchema = z.object({
  period: dateRangeSchema,
  summary: monthlyReportSummarySchema,
  stuckTasks: z.array(taskSchema),
  longestRunningTasks: z.array(taskSchema),
  completedByDay: z.array(completedByDayEntrySchema),
  completedByPriority: completedByPrioritySchema,
});
export type MonthlyReportData = z.infer<typeof monthlyReportDataSchema>;
