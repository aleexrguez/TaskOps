import type { TFunction } from 'i18next';
import type {
  RecurrenceFrequency,
  RecurrenceTemplate,
} from '../types/recurrence.types';
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

/**
 * Parses a YYYY-MM-DD string into a local Date (midnight).
 */
export function parseDateKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Returns the number of calendar days between two dates (a - b).
 * Both dates are treated as midnight local time.
 */
function diffInDays(a: Date, b: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const aTime = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  const bTime = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return Math.round((aTime - bTime) / msPerDay);
}

/**
 * Returns the number of whole months between two dates (a - b).
 * Only counts year/month difference, ignores day component.
 */
function diffInMonths(a: Date, b: Date): number {
  return (
    (a.getFullYear() - b.getFullYear()) * 12 + (a.getMonth() - b.getMonth())
  );
}

/**
 * Returns true if `targetDate` falls on an interval step from `startDate`
 * for the given frequency. Returns false if targetDate is before startDate.
 *
 * When interval === 1, always returns true (as long as target >= start).
 */
export function isIntervalMatch(
  frequency: RecurrenceFrequency,
  interval: number,
  startDate: string,
  targetDate: string,
): boolean {
  const start = parseDateKey(startDate);
  const target = parseDateKey(targetDate);

  if (target < start) return false;
  if (interval === 1) return true;

  switch (frequency) {
    case 'daily': {
      return diffInDays(target, start) % interval === 0;
    }
    case 'weekly': {
      const weeks = Math.floor(diffInDays(target, start) / 7);
      return weeks % interval === 0;
    }
    case 'monthly': {
      const months = diffInMonths(target, start);
      return months >= 0 && months % interval === 0;
    }
    default:
      return false;
  }
}

// ---------------------------------------------------------------------------
// Next occurrences preview
// ---------------------------------------------------------------------------

/**
 * Parameters for computing the next N occurrence dates of a recurrence.
 * leadTimeDays is intentionally excluded — preview shows occurrence/due dates,
 * not generation dates.
 */
export interface GetNextOccurrencesParams {
  frequency: RecurrenceFrequency;
  interval: number;
  startDate: string; // YYYY-MM-DD
  weeklyDays?: number[]; // 1=Mon..7=Sun
  monthlyDay?: number; // 1-31
}

const MAX_ITERATIONS = 730;

/**
 * Returns the next `count` occurrence dates (YYYY-MM-DD) for a recurrence,
 * starting from `referenceDate` (defaults to today). Never returns dates
 * before the effective start (max of startDate and referenceDate).
 */
export function getNextOccurrences(
  params: GetNextOccurrencesParams,
  count = 5,
  referenceDate: Date = new Date(),
): string[] {
  const { frequency, interval, startDate, weeklyDays, monthlyDay } = params;

  const startParsed = parseDateKey(startDate);
  const effectiveStart =
    referenceDate > startParsed ? referenceDate : startParsed;

  switch (frequency) {
    case 'daily':
      return getNextDailyOccurrences(
        interval,
        startDate,
        effectiveStart,
        count,
      );
    case 'weekly':
      return getNextWeeklyOccurrences(
        interval,
        startDate,
        effectiveStart,
        weeklyDays ?? [],
        count,
      );
    case 'monthly':
      return getNextMonthlyOccurrences(
        interval,
        startDate,
        effectiveStart,
        monthlyDay,
        count,
      );
    default:
      return [];
  }
}

function getNextDailyOccurrences(
  interval: number,
  startDate: string,
  effectiveStart: Date,
  count: number,
): string[] {
  const results: string[] = [];
  const cursor = new Date(
    effectiveStart.getFullYear(),
    effectiveStart.getMonth(),
    effectiveStart.getDate(),
  );

  for (let i = 0; i < MAX_ITERATIONS && results.length < count; i++) {
    const key = formatDateKey(cursor);
    if (isIntervalMatch('daily', interval, startDate, key)) {
      results.push(key);
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return results;
}

function getNextWeeklyOccurrences(
  interval: number,
  startDate: string,
  effectiveStart: Date,
  weeklyDays: number[],
  count: number,
): string[] {
  if (weeklyDays.length === 0) return [];

  const results: string[] = [];
  const daySet = new Set(weeklyDays);
  const cursor = new Date(
    effectiveStart.getFullYear(),
    effectiveStart.getMonth(),
    effectiveStart.getDate(),
  );

  for (let i = 0; i < MAX_ITERATIONS && results.length < count; i++) {
    const isoDay = getISODayOfWeek(cursor);
    if (daySet.has(isoDay)) {
      const key = formatDateKey(cursor);
      if (isIntervalMatch('weekly', interval, startDate, key)) {
        results.push(key);
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return results;
}

function getNextMonthlyOccurrences(
  interval: number,
  startDate: string,
  effectiveStart: Date,
  monthlyDay: number | undefined,
  count: number,
): string[] {
  if (monthlyDay === undefined) return [];

  const results: string[] = [];
  let year = effectiveStart.getFullYear();
  let month = effectiveStart.getMonth() + 1; // 1-indexed

  for (let i = 0; i < MAX_ITERATIONS && results.length < count; i++) {
    const clamped = clampMonthlyDay(monthlyDay, year, month);
    const candidate = new Date(year, month - 1, clamped);

    if (candidate >= effectiveStart) {
      const key = formatDateKey(candidate);
      if (isIntervalMatch('monthly', interval, startDate, key)) {
        results.push(key);
      }
    }

    // Advance to next month
    month++;
    if (month > 12) {
      month = 1;
      year++;
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Interval helper text
// ---------------------------------------------------------------------------

export function getIntervalHelperText(
  frequency: RecurrenceFrequency,
  t: TFunction,
): string {
  return t(`recurrence:helperText.${frequency}`);
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
  const todayKey = formatDateKey(today);

  // Gate: today must be on or after startDate
  if (todayKey < template.startDate) return null;

  const year = today.getFullYear();
  const month = today.getMonth() + 1; // 1-indexed
  const dayOfMonth = today.getDate();

  switch (template.frequency) {
    case 'daily': {
      if (
        !isIntervalMatch(
          'daily',
          template.interval,
          template.startDate,
          todayKey,
        )
      )
        return null;
      return todayKey;
    }

    case 'weekly': {
      if (!template.weeklyDays || template.weeklyDays.length === 0) {
        return null;
      }
      const isoDay = getISODayOfWeek(today);
      if (!template.weeklyDays.includes(isoDay)) return null;
      if (
        !isIntervalMatch(
          'weekly',
          template.interval,
          template.startDate,
          todayKey,
        )
      )
        return null;
      return todayKey;
    }

    case 'monthly': {
      if (template.monthlyDay === undefined) {
        return null;
      }
      const effectiveDay = clampMonthlyDay(template.monthlyDay, year, month);
      if (effectiveDay !== dayOfMonth) return null;
      if (
        !isIntervalMatch(
          'monthly',
          template.interval,
          template.startDate,
          todayKey,
        )
      )
        return null;
      return todayKey;
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
  const todayKey = formatDateKey(today);

  // Gate: today must be on or after startDate
  if (todayKey < template.startDate) return [];

  const year = today.getFullYear();
  const month = today.getMonth() + 1; // 1-indexed

  switch (template.frequency) {
    case 'daily': {
      if (
        !isIntervalMatch(
          'daily',
          template.interval,
          template.startDate,
          todayKey,
        )
      )
        return [];
      return [todayKey];
    }

    case 'weekly': {
      if (!template.weeklyDays || template.weeklyDays.length === 0) {
        return [];
      }
      const isoDay = getISODayOfWeek(today);
      if (!template.weeklyDays.includes(isoDay)) return [];
      if (
        !isIntervalMatch(
          'weekly',
          template.interval,
          template.startDate,
          todayKey,
        )
      )
        return [];
      return [todayKey];
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
          // Interval match is checked against the OCCURRENCE date, not today
          const occurrenceKey = formatDateKey(occurrence);
          if (occurrenceKey < template.startDate) continue;
          if (
            !isIntervalMatch(
              'monthly',
              template.interval,
              template.startDate,
              occurrenceKey,
            )
          )
            continue;
          result.push(occurrenceKey);
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

const DAY_WEEKDAY_KEYS: Record<number, string> = {
  1: 'weekday.mon',
  2: 'weekday.tue',
  3: 'weekday.wed',
  4: 'weekday.thu',
  5: 'weekday.fri',
  6: 'weekday.sat',
  7: 'weekday.sun',
};

/**
 * Formats an array of ISO weekday numbers (1-7) as a human-readable string.
 * Days are sorted before formatting.
 * e.g. [1,3,5] → "Mon, Wed, Fri"
 */
export function formatWeeklyDays(days: number[], t: TFunction): string {
  return [...days]
    .sort((a, b) => a - b)
    .map((d) => t(`common:${DAY_WEEKDAY_KEYS[d]}`) ?? String(d))
    .join(', ');
}

/**
 * Formats a number as a locale-aware ordinal string using i18n.
 * Handles teen exceptions (11th, 12th, 13th).
 */
function formatOrdinal(n: number, t: TFunction): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return t('recurrence:ordinal.th', { n });
  switch (n % 10) {
    case 1:
      return t('recurrence:ordinal.st', { n });
    case 2:
      return t('recurrence:ordinal.nd', { n });
    case 3:
      return t('recurrence:ordinal.rd', { n });
    default:
      return t('recurrence:ordinal.th', { n });
  }
}

/**
 * Formats a monthly day number as a locale-aware ordinal string.
 * e.g. 1 → "1st" (EN), "1" (ES)
 */
export function formatMonthlyDay(day: number, t: TFunction): string {
  return formatOrdinal(day, t);
}

/**
 * Returns a human-readable label describing the frequency of a template.
 * e.g. "Daily", "Weekly (Mon, Wed, Fri)", "Monthly (15th)"
 */
export function formatFrequencyLabel(
  template: RecurrenceTemplate,
  t: TFunction,
): string {
  const n = template.interval;
  switch (template.frequency) {
    case 'daily':
      return n > 1
        ? t('recurrence:freq.everyNDays', { n })
        : t('recurrence:freq.daily');

    case 'weekly': {
      const prefix =
        n > 1
          ? t('recurrence:freq.everyNWeeks', { n })
          : t('recurrence:freq.weekly');
      if (template.weeklyDays && template.weeklyDays.length > 0) {
        return t('recurrence:freq.withDays', {
          prefix,
          days: formatWeeklyDays(template.weeklyDays, t),
        });
      }
      return prefix;
    }

    case 'monthly': {
      const prefix =
        n > 1
          ? t('recurrence:freq.everyNMonths', { n })
          : t('recurrence:freq.monthly');
      if (template.monthlyDay !== undefined) {
        return t('recurrence:freq.withDay', {
          prefix,
          day: formatMonthlyDay(template.monthlyDay, t),
        });
      }
      return prefix;
    }

    default:
      return t('recurrence:freq.unknown');
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
