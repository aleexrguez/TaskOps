import type { RecurrenceTemplate } from '../types/recurrence.types';
import type {
  Task,
  TaskPriority,
} from '@/features/task-manager/types/task.types';

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

/**
 * Returns the ISO day of week for a given Date:
 * 1 = Monday, 2 = Tuesday, ..., 7 = Sunday
 */
export function getISODayOfWeek(date: Date): number {
  const day = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  return day === 0 ? 7 : day;
}

/**
 * Returns the last day of a given month (1-indexed month: 1=Jan, 12=Dec).
 */
export function getLastDayOfMonth(year: number, month: number): number {
  // Day 0 of next month = last day of given month
  return new Date(year, month, 0).getDate();
}

/**
 * Clamps a monthlyDay to the last valid day of the given month.
 * e.g. day=31 in April → 30, day=29 in Feb non-leap → 28
 */
export function clampMonthlyDay(
  monthlyDay: number,
  year: number,
  month: number,
): number {
  const lastDay = getLastDayOfMonth(year, month);
  return Math.min(monthlyDay, lastDay);
}

/**
 * Formats a Date as "YYYY-MM-DD" using local date parts.
 */
export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ---------------------------------------------------------------------------
// Occurrence logic
// ---------------------------------------------------------------------------

/**
 * Returns the date key (YYYY-MM-DD) if the template should generate an
 * occurrence on `today`, or null if it should not.
 */
export function getOccurrenceDateForToday(
  template: RecurrenceTemplate,
  today: Date = new Date(),
): string | null {
  const year = today.getFullYear();
  const month = today.getMonth() + 1; // 1-indexed
  const dayOfMonth = today.getDate();

  switch (template.frequency) {
    case 'daily': {
      return formatDateKey(today);
    }

    case 'weekly': {
      if (!template.weeklyDays || template.weeklyDays.length === 0) {
        return null;
      }
      const isoDay = getISODayOfWeek(today);
      return template.weeklyDays.includes(isoDay) ? formatDateKey(today) : null;
    }

    case 'monthly': {
      if (template.monthlyDay === undefined) {
        return null;
      }
      const effectiveDay = clampMonthlyDay(template.monthlyDay, year, month);
      return effectiveDay === dayOfMonth ? formatDateKey(today) : null;
    }

    default:
      return null;
  }
}

/**
 * Returns an array of dateKeys (YYYY-MM-DD) whose lead-time window includes
 * today. For daily/weekly this is equivalent to the old single-value logic.
 * For monthly with leadTimeDays > 0, it returns the occurrence date if today
 * falls within the [occurrenceDate - leadTimeDays, occurrenceDate] window.
 *
 * The returned dateKey is ALWAYS the occurrence/due date, never today.
 */
export function getOccurrencesInWindow(
  template: RecurrenceTemplate,
  today: Date = new Date(),
): string[] {
  const year = today.getFullYear();
  const month = today.getMonth() + 1; // 1-indexed

  switch (template.frequency) {
    case 'daily': {
      return [formatDateKey(today)];
    }

    case 'weekly': {
      if (!template.weeklyDays || template.weeklyDays.length === 0) {
        return [];
      }
      const isoDay = getISODayOfWeek(today);
      return template.weeklyDays.includes(isoDay) ? [formatDateKey(today)] : [];
    }

    case 'monthly': {
      if (template.monthlyDay === undefined) {
        return [];
      }

      const leadTime = template.leadTimeDays ?? 0;

      // Check this month's occurrence
      const thisMonthDay = clampMonthlyDay(template.monthlyDay, year, month);
      const thisMonthOccurrence = new Date(year, month - 1, thisMonthDay);

      // Check next month's occurrence (for cross-month lead windows)
      const nextMonth = month === 12 ? 1 : month + 1;
      const nextYear = month === 12 ? year + 1 : year;
      const nextMonthDay = clampMonthlyDay(
        template.monthlyDay,
        nextYear,
        nextMonth,
      );
      const nextMonthOccurrence = new Date(
        nextYear,
        nextMonth - 1,
        nextMonthDay,
      );

      const result: string[] = [];
      const todayTime = today.getTime();

      for (const occurrence of [thisMonthOccurrence, nextMonthOccurrence]) {
        const occurrenceTime = occurrence.getTime();
        const generationStartTime =
          occurrenceTime - leadTime * 24 * 60 * 60 * 1000;

        if (todayTime >= generationStartTime && todayTime <= occurrenceTime) {
          result.push(formatDateKey(occurrence));
        }
      }

      // Deduplicate (clamping could produce same date for two months edge case)
      return [...new Set(result)];
    }

    default:
      return [];
  }
}

// ---------------------------------------------------------------------------
// Pending generation
// ---------------------------------------------------------------------------

export interface PendingGeneration {
  templateId: string;
  dateKey: string;
  title: string;
  description?: string;
  priority: TaskPriority;
}

/**
 * Returns the list of recurrence occurrences that need to be generated today
 * but do not yet have a corresponding task.
 */
export function getPendingGenerations(
  templates: RecurrenceTemplate[],
  existingTasks: Task[],
  today: Date = new Date(),
): PendingGeneration[] {
  const pending: PendingGeneration[] = [];

  for (const template of templates) {
    if (!template.isActive) continue;

    const dateKeys = getOccurrencesInWindow(template, today);

    for (const dateKey of dateKeys) {
      const alreadyExists = existingTasks.some(
        (task) =>
          task.recurrenceTemplateId === template.id &&
          task.recurrenceDateKey === dateKey,
      );
      if (alreadyExists) continue;

      pending.push({
        templateId: template.id,
        dateKey,
        title: template.title,
        ...(template.description !== undefined
          ? { description: template.description }
          : {}),
        priority: template.priority,
      });
    }
  }

  return pending;
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

const DAY_NAMES: Record<number, string> = {
  1: 'Mon',
  2: 'Tue',
  3: 'Wed',
  4: 'Thu',
  5: 'Fri',
  6: 'Sat',
  7: 'Sun',
};

/**
 * Formats an array of ISO weekday numbers (1-7) as a human-readable string.
 * Days are sorted before formatting.
 * e.g. [1,3,5] → "Mon, Wed, Fri"
 */
export function formatWeeklyDays(days: number[]): string {
  return [...days]
    .sort((a, b) => a - b)
    .map((d) => DAY_NAMES[d] ?? String(d))
    .join(', ');
}

/**
 * Returns the ordinal suffix for a number (st, nd, rd, th).
 * Handles teen exceptions (11th, 12th, 13th).
 */
function ordinalSuffix(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return 'th';
  switch (n % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

/**
 * Formats a monthly day number as an ordinal string.
 * e.g. 1 → "1st", 2 → "2nd", 3 → "3rd", 11 → "11th", 21 → "21st"
 */
export function formatMonthlyDay(day: number): string {
  return `${day}${ordinalSuffix(day)}`;
}

/**
 * Returns a human-readable label describing the frequency of a template.
 * e.g. "Daily", "Weekly (Mon, Wed, Fri)", "Monthly (15th)"
 */
export function formatFrequencyLabel(template: RecurrenceTemplate): string {
  switch (template.frequency) {
    case 'daily':
      return 'Daily';

    case 'weekly': {
      if (template.weeklyDays && template.weeklyDays.length > 0) {
        return `Weekly (${formatWeeklyDays(template.weeklyDays)})`;
      }
      return 'Weekly';
    }

    case 'monthly': {
      if (template.monthlyDay !== undefined) {
        return `Monthly (${formatMonthlyDay(template.monthlyDay)})`;
      }
      return 'Monthly';
    }

    default:
      return 'Unknown';
  }
}

// ---------------------------------------------------------------------------
// Grouping helpers
// ---------------------------------------------------------------------------

export interface FrequencyGroups {
  daily: RecurrenceTemplate[];
  weekly: RecurrenceTemplate[];
  monthly: RecurrenceTemplate[];
}

/**
 * Groups an array of recurrence templates by their frequency.
 * Preserves insertion order within each group.
 */
export function groupByFrequency(
  templates: RecurrenceTemplate[],
): FrequencyGroups {
  const groups: FrequencyGroups = { daily: [], weekly: [], monthly: [] };
  for (const template of templates) {
    groups[template.frequency].push(template);
  }
  return groups;
}

// ---------------------------------------------------------------------------
// Task classification
// ---------------------------------------------------------------------------

/**
 * Returns true if the task was generated from a recurrence template
 * (i.e. has a recurrenceDateKey).
 */
export function isGeneratedTask(task: Task): boolean {
  return task.recurrenceDateKey !== undefined;
}
