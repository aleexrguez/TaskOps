import { describe, it, expect, afterAll, beforeAll } from 'vitest';
import type { Task } from '@/features/task-manager/types/task.types';
import type { RecurrenceTemplate } from '../../types/recurrence.types';
import i18n from '@/i18n/i18n';
import {
  getISODayOfWeek,
  getLastDayOfMonth,
  clampMonthlyDay,
  formatDateKey,
  getOccurrenceDateForToday,
  getOccurrencesInWindow,
  getPendingGenerations,
  formatWeeklyDays,
  formatMonthlyDay,
  formatFrequencyLabel,
  getIntervalHelperText,
  isGeneratedTask,
  groupByFrequency,
  isIntervalMatch,
  getNextOccurrences,
} from '../recurrence.utils';

afterAll(async () => {
  await i18n.changeLanguage('en');
});

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

let _taskCounter = 0;
let _templateCounter = 0;

function makeTask(overrides: Partial<Task> = {}): Task {
  _taskCounter += 1;
  const base: Task = {
    id: `00000000-0000-0000-0000-${String(_taskCounter).padStart(12, '0')}`,
    title: `Task ${_taskCounter}`,
    status: 'todo',
    priority: 'medium',
    position: 0,
    isArchived: false,
    createdAt: '2024-01-10T10:00:00.000Z',
    updatedAt: '2024-01-10T10:00:00.000Z',
  };
  return { ...base, ...overrides };
}

function makeTemplate(
  overrides: Partial<RecurrenceTemplate> = {},
): RecurrenceTemplate {
  _templateCounter += 1;
  const base: RecurrenceTemplate = {
    id: `11111111-0000-0000-0000-${String(_templateCounter).padStart(12, '0')}`,
    title: `Template ${_templateCounter}`,
    priority: 'medium',
    frequency: 'daily',
    leadTimeDays: 0,
    interval: 1,
    startDate: '2024-01-01',
    isActive: true,
    createdAt: '2024-01-10T10:00:00.000Z',
    updatedAt: '2024-01-10T10:00:00.000Z',
  };
  return { ...base, ...overrides };
}

beforeEach(() => {
  _taskCounter = 0;
  _templateCounter = 0;
});

// ---------------------------------------------------------------------------
// 1. getISODayOfWeek
// ---------------------------------------------------------------------------

describe('getISODayOfWeek', () => {
  it('returns 1 for Monday', () => {
    // 2024-01-08 is a Monday
    expect(getISODayOfWeek(new Date('2024-01-08T12:00:00'))).toBe(1);
  });

  it('returns 2 for Tuesday', () => {
    // 2024-01-09 is a Tuesday
    expect(getISODayOfWeek(new Date('2024-01-09T12:00:00'))).toBe(2);
  });

  it('returns 3 for Wednesday', () => {
    // 2024-01-10 is a Wednesday
    expect(getISODayOfWeek(new Date('2024-01-10T12:00:00'))).toBe(3);
  });

  it('returns 4 for Thursday', () => {
    // 2024-01-11 is a Thursday
    expect(getISODayOfWeek(new Date('2024-01-11T12:00:00'))).toBe(4);
  });

  it('returns 5 for Friday', () => {
    // 2024-01-12 is a Friday
    expect(getISODayOfWeek(new Date('2024-01-12T12:00:00'))).toBe(5);
  });

  it('returns 6 for Saturday', () => {
    // 2024-01-13 is a Saturday
    expect(getISODayOfWeek(new Date('2024-01-13T12:00:00'))).toBe(6);
  });

  it('returns 7 for Sunday', () => {
    // 2024-01-14 is a Sunday
    expect(getISODayOfWeek(new Date('2024-01-14T12:00:00'))).toBe(7);
  });
});

// ---------------------------------------------------------------------------
// 2. getLastDayOfMonth
// ---------------------------------------------------------------------------

describe('getLastDayOfMonth', () => {
  it('returns 31 for January', () => {
    expect(getLastDayOfMonth(2024, 1)).toBe(31);
  });

  it('returns 28 for February in a non-leap year', () => {
    expect(getLastDayOfMonth(2023, 2)).toBe(28);
  });

  it('returns 29 for February in a leap year', () => {
    expect(getLastDayOfMonth(2024, 2)).toBe(29);
  });

  it('returns 31 for March', () => {
    expect(getLastDayOfMonth(2024, 3)).toBe(31);
  });

  it('returns 30 for April', () => {
    expect(getLastDayOfMonth(2024, 4)).toBe(30);
  });

  it('returns 31 for December', () => {
    expect(getLastDayOfMonth(2024, 12)).toBe(31);
  });

  it('returns 30 for June', () => {
    expect(getLastDayOfMonth(2024, 6)).toBe(30);
  });
});

// ---------------------------------------------------------------------------
// 3. clampMonthlyDay
// ---------------------------------------------------------------------------

describe('clampMonthlyDay', () => {
  it('clamps day 31 to 30 for April', () => {
    expect(clampMonthlyDay(31, 2024, 4)).toBe(30);
  });

  it('clamps day 29 to 28 for February in a non-leap year', () => {
    expect(clampMonthlyDay(29, 2023, 2)).toBe(28);
  });

  it('does NOT clamp day 29 for February in a leap year', () => {
    expect(clampMonthlyDay(29, 2024, 2)).toBe(29);
  });

  it('does NOT clamp day 15 for March (already within range)', () => {
    expect(clampMonthlyDay(15, 2024, 3)).toBe(15);
  });

  it('clamps day 31 to 30 for June', () => {
    expect(clampMonthlyDay(31, 2024, 6)).toBe(30);
  });

  it('does NOT clamp day 31 for January', () => {
    expect(clampMonthlyDay(31, 2024, 1)).toBe(31);
  });

  it('clamps day 30 to 28 for February in a non-leap year', () => {
    expect(clampMonthlyDay(30, 2023, 2)).toBe(28);
  });
});

// ---------------------------------------------------------------------------
// 4. formatDateKey
// ---------------------------------------------------------------------------

describe('formatDateKey', () => {
  it('formats a date as YYYY-MM-DD', () => {
    expect(formatDateKey(new Date(2024, 0, 8))).toBe('2024-01-08');
  });

  it('pads single-digit month and day with zeros', () => {
    expect(formatDateKey(new Date(2024, 8, 5))).toBe('2024-09-05');
  });

  it('formats December correctly', () => {
    expect(formatDateKey(new Date(2024, 11, 31))).toBe('2024-12-31');
  });

  it('formats February 29 in a leap year', () => {
    expect(formatDateKey(new Date(2024, 1, 29))).toBe('2024-02-29');
  });
});

// ---------------------------------------------------------------------------
// 5. getOccurrenceDateForToday
// ---------------------------------------------------------------------------

describe('getOccurrenceDateForToday', () => {
  describe('daily frequency', () => {
    it('always returns the dateKey for today', () => {
      const template = makeTemplate({ frequency: 'daily' });
      const monday = new Date(2024, 0, 8); // Monday
      expect(getOccurrenceDateForToday(template, monday)).toBe('2024-01-08');
    });

    it('returns dateKey on any day of the week', () => {
      const template = makeTemplate({ frequency: 'daily' });
      const sunday = new Date(2024, 0, 14); // Sunday
      expect(getOccurrenceDateForToday(template, sunday)).toBe('2024-01-14');
    });
  });

  describe('weekly frequency', () => {
    it('returns dateKey when today matches one of the weeklyDays (Mon in [1,3,5])', () => {
      const template = makeTemplate({
        frequency: 'weekly',
        weeklyDays: [1, 3, 5],
      });
      const monday = new Date(2024, 0, 8); // Monday
      expect(getOccurrenceDateForToday(template, monday)).toBe('2024-01-08');
    });

    it('returns null when today does NOT match weeklyDays (Tue not in [1,3,5])', () => {
      const template = makeTemplate({
        frequency: 'weekly',
        weeklyDays: [1, 3, 5],
      });
      const tuesday = new Date(2024, 0, 9); // Tuesday
      expect(getOccurrenceDateForToday(template, tuesday)).toBeNull();
    });

    it('returns dateKey when today is Sunday (day 7) and 7 is in weeklyDays', () => {
      const template = makeTemplate({
        frequency: 'weekly',
        weeklyDays: [7],
      });
      const sunday = new Date(2024, 0, 14); // Sunday
      expect(getOccurrenceDateForToday(template, sunday)).toBe('2024-01-14');
    });

    it('returns null when weeklyDays is undefined', () => {
      const template = makeTemplate({ frequency: 'weekly' });
      const monday = new Date(2024, 0, 8);
      expect(getOccurrenceDateForToday(template, monday)).toBeNull();
    });

    it('returns null when today is Saturday but weeklyDays is [1,3,5]', () => {
      const template = makeTemplate({
        frequency: 'weekly',
        weeklyDays: [1, 3, 5],
      });
      const saturday = new Date(2024, 0, 13); // Saturday
      expect(getOccurrenceDateForToday(template, saturday)).toBeNull();
    });
  });

  describe('monthly frequency', () => {
    it('returns dateKey when today is the 15th and monthlyDay is 15', () => {
      const template = makeTemplate({
        frequency: 'monthly',
        monthlyDay: 15,
      });
      const the15th = new Date(2024, 0, 15);
      expect(getOccurrenceDateForToday(template, the15th)).toBe('2024-01-15');
    });

    it('returns null when today is the 14th and monthlyDay is 15', () => {
      const template = makeTemplate({
        frequency: 'monthly',
        monthlyDay: 15,
      });
      const the14th = new Date(2024, 0, 14);
      expect(getOccurrenceDateForToday(template, the14th)).toBeNull();
    });

    it('clamps day 31 to 30 for April — generates on Apr 30', () => {
      const template = makeTemplate({
        frequency: 'monthly',
        monthlyDay: 31,
      });
      const apr30 = new Date(2024, 3, 30); // April 30
      expect(getOccurrenceDateForToday(template, apr30)).toBe('2024-04-30');
    });

    it('clamps day 31 to 30 for April — does NOT generate on Apr 31 (non-existent)', () => {
      const template = makeTemplate({
        frequency: 'monthly',
        monthlyDay: 31,
      });
      // April 31 doesn't exist — the clamp means apr30 is the match day
      const apr29 = new Date(2024, 3, 29); // April 29
      expect(getOccurrenceDateForToday(template, apr29)).toBeNull();
    });

    it('clamps day 29 to 28 for February in non-leap year — generates on Feb 28', () => {
      const template = makeTemplate({
        frequency: 'monthly',
        monthlyDay: 29,
        startDate: '2023-01-01',
      });
      const feb28NonLeap = new Date(2023, 1, 28); // Feb 28 2023 (non-leap)
      expect(getOccurrenceDateForToday(template, feb28NonLeap)).toBe(
        '2023-02-28',
      );
    });

    it('does NOT clamp day 29 for February in a leap year — generates on Feb 29', () => {
      const template = makeTemplate({
        frequency: 'monthly',
        monthlyDay: 29,
      });
      const feb29Leap = new Date(2024, 1, 29); // Feb 29 2024 (leap year)
      expect(getOccurrenceDateForToday(template, feb29Leap)).toBe('2024-02-29');
    });

    it('returns null when monthlyDay is undefined', () => {
      const template = makeTemplate({ frequency: 'monthly' });
      const the15th = new Date(2024, 0, 15);
      expect(getOccurrenceDateForToday(template, the15th)).toBeNull();
    });
  });
});

// ---------------------------------------------------------------------------
// 6. getPendingGenerations
// ---------------------------------------------------------------------------

describe('getPendingGenerations', () => {
  const TODAY = new Date(2024, 0, 8); // Monday, January 8 2024
  const TODAY_KEY = '2024-01-08';

  it('returns a pending generation for an active daily template with no existing task', () => {
    const template = makeTemplate({ frequency: 'daily' });
    const result = getPendingGenerations([template], [], TODAY);

    expect(result).toHaveLength(1);
    expect(result[0].templateId).toBe(template.id);
    expect(result[0].dateKey).toBe(TODAY_KEY);
    expect(result[0].title).toBe(template.title);
    expect(result[0].priority).toBe(template.priority);
  });

  it('skips template when a task already exists with matching templateId and dateKey', () => {
    const template = makeTemplate({ frequency: 'daily' });
    const existingTask = makeTask({
      recurrenceTemplateId: template.id,
      recurrenceDateKey: TODAY_KEY,
    });

    const result = getPendingGenerations([template], [existingTask], TODAY);

    expect(result).toHaveLength(0);
  });

  it('does NOT skip template when existing task has different dateKey', () => {
    const template = makeTemplate({ frequency: 'daily' });
    const existingTask = makeTask({
      recurrenceTemplateId: template.id,
      recurrenceDateKey: '2024-01-07', // yesterday
    });

    const result = getPendingGenerations([template], [existingTask], TODAY);

    expect(result).toHaveLength(1);
  });

  it('does NOT skip template when existing task has different templateId', () => {
    const template = makeTemplate({ frequency: 'daily' });
    const existingTask = makeTask({
      recurrenceTemplateId: '99999999-0000-0000-0000-000000000001',
      recurrenceDateKey: TODAY_KEY,
    });

    const result = getPendingGenerations([template], [existingTask], TODAY);

    expect(result).toHaveLength(1);
  });

  it('returns multiple pending for multiple active templates', () => {
    const template1 = makeTemplate({ frequency: 'daily' });
    const template2 = makeTemplate({ frequency: 'daily' });

    const result = getPendingGenerations([template1, template2], [], TODAY);

    expect(result).toHaveLength(2);
    expect(result.map((p) => p.templateId)).toContain(template1.id);
    expect(result.map((p) => p.templateId)).toContain(template2.id);
  });

  it('returns empty array for empty templates list', () => {
    const result = getPendingGenerations([], [], TODAY);
    expect(result).toEqual([]);
  });

  it('skips inactive templates', () => {
    const inactiveTemplate = makeTemplate({
      frequency: 'daily',
      isActive: false,
    });

    const result = getPendingGenerations([inactiveTemplate], [], TODAY);

    expect(result).toHaveLength(0);
  });

  it('skips weekly template when today is not in weeklyDays', () => {
    // TODAY is Monday (1). Template runs on Wed (3) and Fri (5).
    const template = makeTemplate({
      frequency: 'weekly',
      weeklyDays: [3, 5],
    });

    const result = getPendingGenerations([template], [], TODAY);

    expect(result).toHaveLength(0);
  });

  it('includes weekly template when today is in weeklyDays', () => {
    // TODAY is Monday (1). Template runs Mon (1) and Fri (5).
    const template = makeTemplate({
      frequency: 'weekly',
      weeklyDays: [1, 5],
    });

    const result = getPendingGenerations([template], [], TODAY);

    expect(result).toHaveLength(1);
  });

  it('includes pending description when template has description', () => {
    const template = makeTemplate({
      frequency: 'daily',
      description: 'Do the thing',
    });

    const result = getPendingGenerations([template], [], TODAY);

    expect(result[0].description).toBe('Do the thing');
  });

  it('omits description in pending when template has no description', () => {
    const template = makeTemplate({ frequency: 'daily' });

    const result = getPendingGenerations([template], [], TODAY);

    expect(result[0].description).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// 7. formatWeeklyDays
// ---------------------------------------------------------------------------

describe('formatWeeklyDays', () => {
  const t = i18n.t.bind(i18n);

  it('formats [1] as "Mon"', () => {
    expect(formatWeeklyDays([1], t)).toBe('Mon');
  });

  it('formats [1, 3, 5] as "Mon, Wed, Fri"', () => {
    expect(formatWeeklyDays([1, 3, 5], t)).toBe('Mon, Wed, Fri');
  });

  it('formats [2, 4] as "Tue, Thu"', () => {
    expect(formatWeeklyDays([2, 4], t)).toBe('Tue, Thu');
  });

  it('formats [6, 7] as "Sat, Sun"', () => {
    expect(formatWeeklyDays([6, 7], t)).toBe('Sat, Sun');
  });

  it('formats all 7 days', () => {
    expect(formatWeeklyDays([1, 2, 3, 4, 5, 6, 7], t)).toBe(
      'Mon, Tue, Wed, Thu, Fri, Sat, Sun',
    );
  });

  it('formats days even if passed out of order', () => {
    // [5, 1, 3] — should preserve the given order (or sort, be consistent)
    // We sort by day number for consistent display
    expect(formatWeeklyDays([5, 1, 3], t)).toBe('Mon, Wed, Fri');
  });
});

// ---------------------------------------------------------------------------
// 8. formatMonthlyDay
// ---------------------------------------------------------------------------

describe('formatMonthlyDay', () => {
  const t = i18n.t.bind(i18n);

  it('formats 1 as "1st"', () => {
    expect(formatMonthlyDay(1, t)).toBe('1st');
  });

  it('formats 2 as "2nd"', () => {
    expect(formatMonthlyDay(2, t)).toBe('2nd');
  });

  it('formats 3 as "3rd"', () => {
    expect(formatMonthlyDay(3, t)).toBe('3rd');
  });

  it('formats 4 as "4th"', () => {
    expect(formatMonthlyDay(4, t)).toBe('4th');
  });

  it('formats 11 as "11th" (teen exception)', () => {
    expect(formatMonthlyDay(11, t)).toBe('11th');
  });

  it('formats 12 as "12th" (teen exception)', () => {
    expect(formatMonthlyDay(12, t)).toBe('12th');
  });

  it('formats 13 as "13th" (teen exception)', () => {
    expect(formatMonthlyDay(13, t)).toBe('13th');
  });

  it('formats 21 as "21st"', () => {
    expect(formatMonthlyDay(21, t)).toBe('21st');
  });

  it('formats 22 as "22nd"', () => {
    expect(formatMonthlyDay(22, t)).toBe('22nd');
  });

  it('formats 23 as "23rd"', () => {
    expect(formatMonthlyDay(23, t)).toBe('23rd');
  });

  it('formats 31 as "31st"', () => {
    expect(formatMonthlyDay(31, t)).toBe('31st');
  });

  it('formats 15 as "15th"', () => {
    expect(formatMonthlyDay(15, t)).toBe('15th');
  });
});

// ---------------------------------------------------------------------------
// 9. formatFrequencyLabel
// ---------------------------------------------------------------------------

describe('formatFrequencyLabel', () => {
  const t = i18n.t.bind(i18n);

  it('returns "Daily" for a daily template', () => {
    const template = makeTemplate({ frequency: 'daily' });
    expect(formatFrequencyLabel(template, t)).toBe('Daily');
  });

  it('returns "Weekly (Mon, Wed, Fri)" for a weekly template with [1,3,5]', () => {
    const template = makeTemplate({
      frequency: 'weekly',
      weeklyDays: [1, 3, 5],
    });
    expect(formatFrequencyLabel(template, t)).toBe('Weekly (Mon, Wed, Fri)');
  });

  it('returns "Weekly" for a weekly template without weeklyDays', () => {
    const template = makeTemplate({ frequency: 'weekly' });
    expect(formatFrequencyLabel(template, t)).toBe('Weekly');
  });

  it('returns "Monthly (15th)" for a monthly template with monthlyDay 15', () => {
    const template = makeTemplate({
      frequency: 'monthly',
      monthlyDay: 15,
    });
    expect(formatFrequencyLabel(template, t)).toBe('Monthly (15th)');
  });

  it('returns "Monthly" for a monthly template without monthlyDay', () => {
    const template = makeTemplate({ frequency: 'monthly' });
    expect(formatFrequencyLabel(template, t)).toBe('Monthly');
  });

  it('returns "Monthly (1st)" for monthlyDay 1', () => {
    const template = makeTemplate({ frequency: 'monthly', monthlyDay: 1 });
    expect(formatFrequencyLabel(template, t)).toBe('Monthly (1st)');
  });
});

// ---------------------------------------------------------------------------
// 10. isGeneratedTask
// ---------------------------------------------------------------------------

describe('isGeneratedTask', () => {
  it('returns true when task has recurrenceDateKey set', () => {
    const task = makeTask({ recurrenceDateKey: '2024-01-08' });
    expect(isGeneratedTask(task)).toBe(true);
  });

  it('returns false when task has no recurrenceDateKey', () => {
    const task = makeTask();
    expect(isGeneratedTask(task)).toBe(false);
  });

  it('returns false when task recurrenceDateKey is undefined', () => {
    const task = makeTask({ recurrenceDateKey: undefined });
    expect(isGeneratedTask(task)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 11. getOccurrencesInWindow — monthly lead time
// ---------------------------------------------------------------------------

describe('getOccurrencesInWindow — monthly lead time', () => {
  it('returns occurrence dateKey when today is within lead window (5 days before Jan 1)', () => {
    // today = Dec 27 2026, occurrence = Jan 1 2027, leadTimeDays = 5
    // generationStart = Dec 27 → today >= start → include
    const template = makeTemplate({
      frequency: 'monthly',
      monthlyDay: 1,
      leadTimeDays: 5,
    });
    const today = new Date(2026, 11, 27); // Dec 27 2026
    expect(getOccurrencesInWindow(template, today)).toEqual(['2027-01-01']);
  });

  it('returns occurrence dateKey when today is exactly at the lead window boundary', () => {
    // today = Dec 26 2026, generationStart = Jan 1 - 5 = Dec 27 → NOT in window
    // Actually: generationStart = Jan 1 minus 5 days = Dec 27 2026
    // Dec 26 is BEFORE Dec 27 → outside window → returns []
    const template = makeTemplate({
      frequency: 'monthly',
      monthlyDay: 1,
      leadTimeDays: 5,
    });
    const today = new Date(2026, 11, 26); // Dec 26 2026
    expect(getOccurrencesInWindow(template, today)).toEqual([]);
  });

  it('returns occurrence dateKey when today equals generationStart (boundary inclusive)', () => {
    // today = Dec 27 2026 = generationStart (Jan 1 - 5 days) → in window
    const template = makeTemplate({
      frequency: 'monthly',
      monthlyDay: 1,
      leadTimeDays: 5,
    });
    const today = new Date(2026, 11, 27); // Dec 27 2026
    expect(getOccurrencesInWindow(template, today)).toEqual(['2027-01-01']);
  });

  it('returns occurrence dateKey when today IS the due date', () => {
    // today = Jan 1 2027, occurrence = Jan 1 2027, leadTimeDays = 5
    const template = makeTemplate({
      frequency: 'monthly',
      monthlyDay: 1,
      leadTimeDays: 5,
    });
    const today = new Date(2027, 0, 1); // Jan 1 2027
    expect(getOccurrencesInWindow(template, today)).toEqual(['2027-01-01']);
  });

  it('returns [] when today is outside the lead window (too early)', () => {
    // today = Dec 25 2026, generationStart = Dec 27 → outside window
    const template = makeTemplate({
      frequency: 'monthly',
      monthlyDay: 1,
      leadTimeDays: 5,
    });
    const today = new Date(2026, 11, 25); // Dec 25 2026
    expect(getOccurrencesInWindow(template, today)).toEqual([]);
  });

  it('behaves like current logic for leadTimeDays = 0 (returns dateKey only on due date)', () => {
    const template = makeTemplate({
      frequency: 'monthly',
      monthlyDay: 1,
      leadTimeDays: 0,
    });
    const dueDate = new Date(2027, 0, 1); // Jan 1 2027
    expect(getOccurrencesInWindow(template, dueDate)).toEqual(['2027-01-01']);
  });

  it('returns [] for leadTimeDays = 0 when today is not the due date', () => {
    const template = makeTemplate({
      frequency: 'monthly',
      monthlyDay: 1,
      leadTimeDays: 0,
    });
    const dayBefore = new Date(2026, 11, 31); // Dec 31 2026
    expect(getOccurrencesInWindow(template, dayBefore)).toEqual([]);
  });

  it('handles clamping correctly — monthlyDay 31, leadTimeDays 5, Feb 28 non-leap', () => {
    // occurrence = Feb 28 2023 (31 clamped to 28), generationStart = Feb 23 2023
    const template = makeTemplate({
      frequency: 'monthly',
      monthlyDay: 31,
      leadTimeDays: 5,
      startDate: '2023-01-01',
    });
    const today = new Date(2023, 1, 25); // Feb 25 2023 — within window
    expect(getOccurrencesInWindow(template, today)).toEqual(['2023-02-28']);
  });

  it('handles lead window crossing month boundary (day 3, leadTimeDays 5, today Nov 28)', () => {
    // occurrence = Dec 3 2026, generationStart = Nov 28 2026
    // today = Nov 28 → exactly at boundary → in window
    const template = makeTemplate({
      frequency: 'monthly',
      monthlyDay: 3,
      leadTimeDays: 5,
    });
    const today = new Date(2026, 10, 28); // Nov 28 2026
    expect(getOccurrencesInWindow(template, today)).toEqual(['2026-12-03']);
  });

  it('daily with leadTimeDays = 0 returns [todayKey] (same as before)', () => {
    const template = makeTemplate({ frequency: 'daily', leadTimeDays: 0 });
    const today = new Date(2026, 0, 10); // Jan 10 2026
    expect(getOccurrencesInWindow(template, today)).toEqual(['2026-01-10']);
  });

  it('weekly with leadTimeDays = 0 returns [todayKey] when day matches', () => {
    const template = makeTemplate({
      frequency: 'weekly',
      weeklyDays: [1],
      leadTimeDays: 0,
    });
    const monday = new Date(2024, 0, 8); // Monday
    expect(getOccurrencesInWindow(template, monday)).toEqual(['2024-01-08']);
  });
});

// ---------------------------------------------------------------------------
// 12. getPendingGenerations — lead time dedup
// ---------------------------------------------------------------------------

describe('getPendingGenerations — monthly with lead time', () => {
  it('returns pending with correct dateKey (occurrence date, not generation date) for early gen', () => {
    // today = Nov 28 2026, occurrence = Dec 3, leadTimeDays = 5
    const template = makeTemplate({
      frequency: 'monthly',
      monthlyDay: 3,
      leadTimeDays: 5,
    });
    const today = new Date(2026, 10, 28); // Nov 28

    const result = getPendingGenerations([template], [], today);

    expect(result).toHaveLength(1);
    expect(result[0].dateKey).toBe('2026-12-03');
  });

  it('skips template when task already exists for the occurrence dateKey', () => {
    const template = makeTemplate({
      frequency: 'monthly',
      monthlyDay: 3,
      leadTimeDays: 5,
    });
    const today = new Date(2026, 10, 28); // Nov 28 — within window for Dec 3
    const existingTask = makeTask({
      recurrenceTemplateId: template.id,
      recurrenceDateKey: '2026-12-03', // task already generated for Dec 3
    });

    const result = getPendingGenerations([template], [existingTask], today);

    expect(result).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 13. groupByFrequency
// ---------------------------------------------------------------------------

describe('groupByFrequency', () => {
  it('groups mixed templates into the correct frequency buckets', () => {
    const daily1 = makeTemplate({ frequency: 'daily' });
    const weekly1 = makeTemplate({ frequency: 'weekly', weeklyDays: [1] });
    const monthly1 = makeTemplate({ frequency: 'monthly', monthlyDay: 15 });

    const result = groupByFrequency([daily1, weekly1, monthly1]);

    expect(result.daily).toEqual([daily1]);
    expect(result.weekly).toEqual([weekly1]);
    expect(result.monthly).toEqual([monthly1]);
  });

  it('returns empty arrays for frequency groups with no templates', () => {
    const daily1 = makeTemplate({ frequency: 'daily' });

    const result = groupByFrequency([daily1]);

    expect(result.weekly).toEqual([]);
    expect(result.monthly).toEqual([]);
  });

  it('returns all empty arrays for an empty input array', () => {
    const result = groupByFrequency([]);

    expect(result.daily).toEqual([]);
    expect(result.weekly).toEqual([]);
    expect(result.monthly).toEqual([]);
  });

  it('preserves insertion order within each group', () => {
    const daily1 = makeTemplate({ frequency: 'daily', title: 'First' });
    const daily2 = makeTemplate({ frequency: 'daily', title: 'Second' });
    const daily3 = makeTemplate({ frequency: 'daily', title: 'Third' });

    const result = groupByFrequency([daily1, daily2, daily3]);

    expect(result.daily[0].title).toBe('First');
    expect(result.daily[1].title).toBe('Second');
    expect(result.daily[2].title).toBe('Third');
  });

  it('places multiple templates of the same frequency in the same bucket', () => {
    const weekly1 = makeTemplate({ frequency: 'weekly', weeklyDays: [1] });
    const weekly2 = makeTemplate({ frequency: 'weekly', weeklyDays: [3] });
    const weekly3 = makeTemplate({ frequency: 'weekly', weeklyDays: [5] });

    const result = groupByFrequency([weekly1, weekly2, weekly3]);

    expect(result.weekly).toHaveLength(3);
    expect(result.daily).toHaveLength(0);
    expect(result.monthly).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 14. isIntervalMatch
// ---------------------------------------------------------------------------

describe('isIntervalMatch', () => {
  it('daily interval=1 always matches (same or after startDate)', () => {
    expect(isIntervalMatch('daily', 1, '2024-01-01', '2024-01-01')).toBe(true);
    expect(isIntervalMatch('daily', 1, '2024-01-01', '2024-06-15')).toBe(true);
  });

  it('returns false when targetDate is before startDate', () => {
    expect(isIntervalMatch('daily', 1, '2024-01-10', '2024-01-09')).toBe(false);
    expect(isIntervalMatch('weekly', 1, '2024-01-10', '2024-01-09')).toBe(
      false,
    );
    expect(isIntervalMatch('monthly', 1, '2024-01-10', '2024-01-09')).toBe(
      false,
    );
  });

  it('daily interval=10 matches every 10 days from start', () => {
    // start = Jan 1, so matches on Jan 1, Jan 11, Jan 21, Jan 31, etc.
    expect(isIntervalMatch('daily', 10, '2024-01-01', '2024-01-01')).toBe(true); // day 0
    expect(isIntervalMatch('daily', 10, '2024-01-01', '2024-01-02')).toBe(
      false,
    ); // day 1
    expect(isIntervalMatch('daily', 10, '2024-01-01', '2024-01-11')).toBe(true); // day 10
    expect(isIntervalMatch('daily', 10, '2024-01-01', '2024-01-21')).toBe(true); // day 20
    expect(isIntervalMatch('daily', 10, '2024-01-01', '2024-01-15')).toBe(
      false,
    ); // day 14
  });

  it('weekly interval=4 matches every 4 weeks from start', () => {
    // start = 2024-01-01 (Monday). Week 0 = Jan 1-7, Week 4 = Jan 29 - Feb 4
    expect(isIntervalMatch('weekly', 4, '2024-01-01', '2024-01-01')).toBe(true); // week 0
    expect(isIntervalMatch('weekly', 4, '2024-01-01', '2024-01-03')).toBe(true); // still week 0
    expect(isIntervalMatch('weekly', 4, '2024-01-01', '2024-01-08')).toBe(
      false,
    ); // week 1
    expect(isIntervalMatch('weekly', 4, '2024-01-01', '2024-01-29')).toBe(true); // week 4
    expect(isIntervalMatch('weekly', 4, '2024-01-01', '2024-01-30')).toBe(true); // still week 4
    expect(isIntervalMatch('weekly', 4, '2024-01-01', '2024-02-05')).toBe(
      false,
    ); // week 5
  });

  it('monthly interval=2 matches every 2 months from start', () => {
    // start = 2024-01-15. Matches Jan, Mar, May, Jul, Sep, Nov
    expect(isIntervalMatch('monthly', 2, '2024-01-15', '2024-01-15')).toBe(
      true,
    ); // month 0
    expect(isIntervalMatch('monthly', 2, '2024-01-15', '2024-02-15')).toBe(
      false,
    ); // month 1
    expect(isIntervalMatch('monthly', 2, '2024-01-15', '2024-03-15')).toBe(
      true,
    ); // month 2
    expect(isIntervalMatch('monthly', 2, '2024-01-15', '2024-05-15')).toBe(
      true,
    ); // month 4
    expect(isIntervalMatch('monthly', 2, '2024-01-15', '2024-04-15')).toBe(
      false,
    ); // month 3
  });

  it('Fitness Park case: weekly interval=4 from a specific Friday', () => {
    // Start: Friday 2024-01-05
    // Week 0: Jan 5-11, Week 4: Feb 2-8, Week 8: Mar 1-7
    const start = '2024-01-05';
    expect(isIntervalMatch('weekly', 4, start, '2024-01-05')).toBe(true); // week 0 Fri
    expect(isIntervalMatch('weekly', 4, start, '2024-01-12')).toBe(false); // week 1 Fri
    expect(isIntervalMatch('weekly', 4, start, '2024-01-19')).toBe(false); // week 2 Fri
    expect(isIntervalMatch('weekly', 4, start, '2024-01-26')).toBe(false); // week 3 Fri
    expect(isIntervalMatch('weekly', 4, start, '2024-02-02')).toBe(true); // week 4 Fri
    expect(isIntervalMatch('weekly', 4, start, '2024-03-01')).toBe(true); // week 8 Fri
  });
});

// ---------------------------------------------------------------------------
// 15. getOccurrenceDateForToday — with intervals
// ---------------------------------------------------------------------------

describe('getOccurrenceDateForToday — intervals', () => {
  it('daily interval=1 regression: always generates', () => {
    const template = makeTemplate({
      frequency: 'daily',
      interval: 1,
      startDate: '2024-01-01',
    });
    expect(getOccurrenceDateForToday(template, new Date(2024, 0, 8))).toBe(
      '2024-01-08',
    );
    expect(getOccurrenceDateForToday(template, new Date(2024, 0, 14))).toBe(
      '2024-01-14',
    );
  });

  it('weekly interval=1 regression: generates on matching day', () => {
    const template = makeTemplate({
      frequency: 'weekly',
      weeklyDays: [1, 3, 5],
      interval: 1,
      startDate: '2024-01-01',
    });
    const monday = new Date(2024, 0, 8);
    expect(getOccurrenceDateForToday(template, monday)).toBe('2024-01-08');
    const tuesday = new Date(2024, 0, 9);
    expect(getOccurrenceDateForToday(template, tuesday)).toBeNull();
  });

  it('monthly interval=1 regression: generates on matching day', () => {
    const template = makeTemplate({
      frequency: 'monthly',
      monthlyDay: 15,
      interval: 1,
      startDate: '2024-01-01',
    });
    expect(getOccurrenceDateForToday(template, new Date(2024, 0, 15))).toBe(
      '2024-01-15',
    );
    expect(
      getOccurrenceDateForToday(template, new Date(2024, 0, 14)),
    ).toBeNull();
  });

  it('daily interval=3: generates on days 0, 3, 6 from start', () => {
    const template = makeTemplate({
      frequency: 'daily',
      interval: 3,
      startDate: '2024-01-01',
    });
    expect(getOccurrenceDateForToday(template, new Date(2024, 0, 1))).toBe(
      '2024-01-01',
    ); // day 0
    expect(
      getOccurrenceDateForToday(template, new Date(2024, 0, 2)),
    ).toBeNull(); // day 1
    expect(
      getOccurrenceDateForToday(template, new Date(2024, 0, 3)),
    ).toBeNull(); // day 2
    expect(getOccurrenceDateForToday(template, new Date(2024, 0, 4))).toBe(
      '2024-01-04',
    ); // day 3
  });

  it('weekly interval=4 — Fitness Park: only generates every 4th week on Friday', () => {
    const template = makeTemplate({
      frequency: 'weekly',
      weeklyDays: [5], // Friday
      interval: 4,
      startDate: '2024-01-05', // a Friday
    });
    // Week 0 Friday = Jan 5
    expect(getOccurrenceDateForToday(template, new Date(2024, 0, 5))).toBe(
      '2024-01-05',
    );
    // Week 1 Friday = Jan 12
    expect(
      getOccurrenceDateForToday(template, new Date(2024, 0, 12)),
    ).toBeNull();
    // Week 4 Friday = Feb 2
    expect(getOccurrenceDateForToday(template, new Date(2024, 1, 2))).toBe(
      '2024-02-02',
    );
  });

  it('returns null when today is before startDate', () => {
    const template = makeTemplate({
      frequency: 'daily',
      interval: 1,
      startDate: '2024-06-01',
    });
    expect(
      getOccurrenceDateForToday(template, new Date(2024, 4, 31)),
    ).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 16. getOccurrencesInWindow — monthly interval + leadTimeDays
// ---------------------------------------------------------------------------

describe('getOccurrencesInWindow — monthly interval + leadTimeDays', () => {
  it('monthly interval=2 with leadTimeDays=3: generates in window for matching months only', () => {
    // start = Jan 15. interval=2 → matches Jan, Mar, May...
    // monthlyDay = 15, leadTimeDays = 3
    const template = makeTemplate({
      frequency: 'monthly',
      monthlyDay: 15,
      interval: 2,
      startDate: '2024-01-15',
      leadTimeDays: 3,
    });

    // Mar 12 = 3 days before Mar 15. Mar is month 2 (0-indexed) = matches
    expect(getOccurrencesInWindow(template, new Date(2024, 2, 12))).toEqual([
      '2024-03-15',
    ]);

    // Mar 15 = due date. Matches.
    expect(getOccurrencesInWindow(template, new Date(2024, 2, 15))).toEqual([
      '2024-03-15',
    ]);

    // Feb 12 = 3 days before Feb 15. Feb is month 1 = does NOT match (interval=2)
    expect(getOccurrencesInWindow(template, new Date(2024, 1, 12))).toEqual([]);

    // Feb 15 = due date for Feb. Does NOT match interval.
    expect(getOccurrencesInWindow(template, new Date(2024, 1, 15))).toEqual([]);
  });

  it('interval check uses targetDate (occurrence), not today', () => {
    // start = Jan 1. interval=2, monthlyDay=3, leadTimeDays=5
    // Matches Jan, Mar, May...
    // Today = Feb 28 (5 days before Mar 3) → occurrence is Mar 3 → Mar is month 2 → matches
    const template = makeTemplate({
      frequency: 'monthly',
      monthlyDay: 3,
      interval: 2,
      startDate: '2024-01-01',
      leadTimeDays: 5,
    });

    // Feb 28 is within lead window of Mar 3. Mar is interval match.
    expect(getOccurrencesInWindow(template, new Date(2024, 1, 28))).toEqual([
      '2024-03-03',
    ]);
  });
});

// ---------------------------------------------------------------------------
// 17. formatFrequencyLabel — with intervals
// ---------------------------------------------------------------------------

describe('formatFrequencyLabel — intervals', () => {
  const t = i18n.t.bind(i18n);

  it('returns "Every 10 days" for daily interval=10', () => {
    const template = makeTemplate({ frequency: 'daily', interval: 10 });
    expect(formatFrequencyLabel(template, t)).toBe('Every 10 days');
  });

  it('returns "Every 4 weeks (Fri)" for weekly interval=4 weeklyDays=[5]', () => {
    const template = makeTemplate({
      frequency: 'weekly',
      weeklyDays: [5],
      interval: 4,
    });
    expect(formatFrequencyLabel(template, t)).toBe('Every 4 weeks (Fri)');
  });

  it('returns "Every 2 months (15th)" for monthly interval=2 monthlyDay=15', () => {
    const template = makeTemplate({
      frequency: 'monthly',
      monthlyDay: 15,
      interval: 2,
    });
    expect(formatFrequencyLabel(template, t)).toBe('Every 2 months (15th)');
  });

  it('returns "Daily" for interval=1 (unchanged)', () => {
    const template = makeTemplate({ frequency: 'daily', interval: 1 });
    expect(formatFrequencyLabel(template, t)).toBe('Daily');
  });
});

// ---------------------------------------------------------------------------
// 18. getNextOccurrences
// ---------------------------------------------------------------------------

describe('getNextOccurrences', () => {
  describe('daily', () => {
    it('returns 5 consecutive days from referenceDate with interval=1', () => {
      const ref = new Date(2026, 4, 11); // May 11 2026
      const result = getNextOccurrences(
        { frequency: 'daily', interval: 1, startDate: '2026-01-01' },
        5,
        ref,
      );
      expect(result).toEqual([
        '2026-05-11',
        '2026-05-12',
        '2026-05-13',
        '2026-05-14',
        '2026-05-15',
      ]);
    });

    it('returns every 3rd day with interval=3', () => {
      const ref = new Date(2026, 0, 1); // Jan 1 2026
      const result = getNextOccurrences(
        { frequency: 'daily', interval: 3, startDate: '2026-01-01' },
        5,
        ref,
      );
      expect(result).toEqual([
        '2026-01-01',
        '2026-01-04',
        '2026-01-07',
        '2026-01-10',
        '2026-01-13',
      ]);
    });

    it('starts from future startDate, not referenceDate', () => {
      const ref = new Date(2026, 0, 1); // Jan 1
      const result = getNextOccurrences(
        { frequency: 'daily', interval: 1, startDate: '2026-06-01' },
        3,
        ref,
      );
      expect(result).toEqual(['2026-06-01', '2026-06-02', '2026-06-03']);
    });

    it('skips past dates when startDate is in the past and interval > 1', () => {
      // startDate = May 18, ref = May 20, interval = 3
      // Days from start: May 18 (0), May 21 (3), May 24 (6)...
      // First date >= May 20 that matches interval: May 21
      const ref = new Date(2026, 4, 20); // May 20
      const result = getNextOccurrences(
        { frequency: 'daily', interval: 3, startDate: '2026-05-18' },
        3,
        ref,
      );
      expect(result).toEqual(['2026-05-21', '2026-05-24', '2026-05-27']);
    });
  });

  describe('weekly', () => {
    it('returns next 5 Mon/Wed/Fri with interval=1', () => {
      // May 11 2026 is a Monday
      const ref = new Date(2026, 4, 11);
      const result = getNextOccurrences(
        {
          frequency: 'weekly',
          interval: 1,
          startDate: '2026-01-01',
          weeklyDays: [1, 3, 5],
        },
        5,
        ref,
      );
      expect(result).toEqual([
        '2026-05-11', // Mon
        '2026-05-13', // Wed
        '2026-05-15', // Fri
        '2026-05-18', // Mon
        '2026-05-20', // Wed
      ]);
    });

    it('skips alternate weeks with interval=2', () => {
      // startDate = Monday Jan 5 2026 (week 0)
      // Week 0: Jan 5-11, Week 2: Jan 19-25, Week 4: Feb 2-8...
      const ref = new Date(2026, 0, 5);
      const result = getNextOccurrences(
        {
          frequency: 'weekly',
          interval: 2,
          startDate: '2026-01-05',
          weeklyDays: [1], // Mondays
        },
        3,
        ref,
      );
      expect(result).toEqual(['2026-01-05', '2026-01-19', '2026-02-02']);
    });

    it('returns empty array when weeklyDays is empty', () => {
      const ref = new Date(2026, 4, 11);
      const result = getNextOccurrences(
        {
          frequency: 'weekly',
          interval: 1,
          startDate: '2026-01-01',
          weeklyDays: [],
        },
        5,
        ref,
      );
      expect(result).toEqual([]);
    });
  });

  describe('monthly', () => {
    it('returns 15th of next 5 months with interval=1', () => {
      const ref = new Date(2026, 0, 15); // Jan 15
      const result = getNextOccurrences(
        {
          frequency: 'monthly',
          interval: 1,
          startDate: '2026-01-01',
          monthlyDay: 15,
        },
        5,
        ref,
      );
      expect(result).toEqual([
        '2026-01-15',
        '2026-02-15',
        '2026-03-15',
        '2026-04-15',
        '2026-05-15',
      ]);
    });

    it('clamps day 31 to last day of short months', () => {
      const ref = new Date(2026, 0, 31); // Jan 31
      const result = getNextOccurrences(
        {
          frequency: 'monthly',
          interval: 1,
          startDate: '2026-01-01',
          monthlyDay: 31,
        },
        5,
        ref,
      );
      // Jan 31, Feb 28, Mar 31, Apr 30, May 31
      expect(result).toEqual([
        '2026-01-31',
        '2026-02-28',
        '2026-03-31',
        '2026-04-30',
        '2026-05-31',
      ]);
    });

    it('skips months with interval=2', () => {
      // startDate = Jan 15, interval=2 → Jan, Mar, May...
      const ref = new Date(2026, 0, 15);
      const result = getNextOccurrences(
        {
          frequency: 'monthly',
          interval: 2,
          startDate: '2026-01-15',
          monthlyDay: 15,
        },
        3,
        ref,
      );
      expect(result).toEqual(['2026-01-15', '2026-03-15', '2026-05-15']);
    });

    it('starts from future startDate', () => {
      const ref = new Date(2026, 0, 1); // Jan 1
      const result = getNextOccurrences(
        {
          frequency: 'monthly',
          interval: 1,
          startDate: '2026-06-01',
          monthlyDay: 10,
        },
        3,
        ref,
      );
      expect(result).toEqual(['2026-06-10', '2026-07-10', '2026-08-10']);
    });

    it('skips current month when monthlyDay already passed', () => {
      // ref = May 20, monthlyDay = 15 → May 15 is past, start from Jun 15
      const ref = new Date(2026, 4, 20); // May 20
      const result = getNextOccurrences(
        {
          frequency: 'monthly',
          interval: 1,
          startDate: '2026-01-01',
          monthlyDay: 15,
        },
        3,
        ref,
      );
      expect(result).toEqual(['2026-06-15', '2026-07-15', '2026-08-15']);
    });

    it('returns empty array when monthlyDay is undefined', () => {
      const ref = new Date(2026, 4, 11);
      const result = getNextOccurrences(
        {
          frequency: 'monthly',
          interval: 1,
          startDate: '2026-01-01',
        },
        5,
        ref,
      );
      expect(result).toEqual([]);
    });
  });

  describe('invariants', () => {
    it('never returns dates before referenceDate for daily', () => {
      const ref = new Date(2026, 4, 20);
      const result = getNextOccurrences(
        { frequency: 'daily', interval: 1, startDate: '2026-01-01' },
        5,
        ref,
      );
      for (const dateKey of result) {
        expect(
          new Date(dateKey + 'T00:00:00').getTime(),
        ).toBeGreaterThanOrEqual(new Date(2026, 4, 20).getTime());
      }
    });

    it('never returns dates before referenceDate for weekly', () => {
      const ref = new Date(2026, 4, 20);
      const result = getNextOccurrences(
        {
          frequency: 'weekly',
          interval: 1,
          startDate: '2026-01-01',
          weeklyDays: [1, 2, 3, 4, 5, 6, 7],
        },
        5,
        ref,
      );
      for (const dateKey of result) {
        expect(
          new Date(dateKey + 'T00:00:00').getTime(),
        ).toBeGreaterThanOrEqual(new Date(2026, 4, 20).getTime());
      }
    });

    it('never returns dates before referenceDate for monthly', () => {
      const ref = new Date(2026, 4, 20);
      const result = getNextOccurrences(
        {
          frequency: 'monthly',
          interval: 1,
          startDate: '2026-01-01',
          monthlyDay: 15,
        },
        5,
        ref,
      );
      for (const dateKey of result) {
        expect(
          new Date(dateKey + 'T00:00:00').getTime(),
        ).toBeGreaterThanOrEqual(new Date(2026, 4, 20).getTime());
      }
    });

    it('does not infinite loop on impossible config (returns limited results)', () => {
      // Weekly with no matching days in weeklyDays is guarded, but test safety cap
      // by using a very large interval where few matches exist within 730 days
      const ref = new Date(2026, 0, 1);
      const result = getNextOccurrences(
        { frequency: 'daily', interval: 365, startDate: '2026-01-01' },
        10,
        ref,
      );
      // With interval=365, only 2 matches in 730 days: day 0 and day 365
      expect(result.length).toBeLessThanOrEqual(2);
      expect(result.length).toBeGreaterThanOrEqual(1);
    });
  });
});

// ---------------------------------------------------------------------------
// 19. INTERVAL_HELPER_TEXT
// ---------------------------------------------------------------------------

describe('getIntervalHelperText', () => {
  const t = i18n.t.bind(i18n);

  it('has entries for all three frequencies', () => {
    expect(getIntervalHelperText('daily', t)).toBe(
      '1 = every day. 2 = every 2 days.',
    );
    expect(getIntervalHelperText('weekly', t)).toBe(
      '1 = every week. 2 = every 2 weeks.',
    );
    expect(getIntervalHelperText('monthly', t)).toBe(
      '1 = every month. 2 = every 2 months.',
    );
  });
});

// ---------------------------------------------------------------------------
// 20. formatFrequencyLabel — Spanish
// ---------------------------------------------------------------------------

describe('formatFrequencyLabel — Spanish', () => {
  beforeAll(async () => {
    await i18n.changeLanguage('es');
  });

  afterAll(async () => {
    await i18n.changeLanguage('en');
  });

  const t = i18n.t.bind(i18n);

  it('returns "Diaria" for daily', () => {
    const template = makeTemplate({ frequency: 'daily' });
    expect(formatFrequencyLabel(template, t)).toBe('Diaria');
  });

  it('returns "Cada 2 dias" for daily interval=2', () => {
    const template = makeTemplate({ frequency: 'daily', interval: 2 });
    expect(formatFrequencyLabel(template, t)).toBe('Cada 2 dias');
  });

  it('returns weekly with Spanish days', () => {
    const template = makeTemplate({
      frequency: 'weekly',
      weeklyDays: [1, 3, 5],
    });
    expect(formatFrequencyLabel(template, t)).toBe('Semanal los Lun, Mie, Vie');
  });

  it('returns monthly with plain number (no ordinal suffix)', () => {
    const template = makeTemplate({ frequency: 'monthly', monthlyDay: 15 });
    expect(formatFrequencyLabel(template, t)).toBe('Mensual el dia 15');
  });

  it('returns interval helper text in Spanish', () => {
    expect(getIntervalHelperText('daily', t)).toBe(
      '1 = cada dia. 2 = cada 2 dias.',
    );
  });
});

// ---------------------------------------------------------------------------
// 17. getOccurrencesInWindow — weekly lead time
// ---------------------------------------------------------------------------

describe('getOccurrencesInWindow — weekly lead time', () => {
  // 2024-01-08 is a Monday, 2024-01-10 is a Wednesday, 2024-01-12 is a Friday

  it('leadTimeDays 0 preserves current behavior — generates only on occurrence day', () => {
    const template = makeTemplate({
      frequency: 'weekly',
      weeklyDays: [5], // Friday
      leadTimeDays: 0,
    });
    // Today is Friday 2024-01-12 → should return the occurrence
    expect(getOccurrencesInWindow(template, new Date(2024, 0, 12))).toEqual([
      '2024-01-12',
    ]);
    // Today is Thursday 2024-01-11 → should NOT return anything
    expect(getOccurrencesInWindow(template, new Date(2024, 0, 11))).toEqual([]);
  });

  it('leadTimeDays 0 returns empty when today is not a weekly day', () => {
    const template = makeTemplate({
      frequency: 'weekly',
      weeklyDays: [1], // Monday
      leadTimeDays: 0,
    });
    // Today is Wednesday
    expect(getOccurrencesInWindow(template, new Date(2024, 0, 10))).toEqual([]);
  });

  it('leadTimeDays 3 returns occurrence 2 days away', () => {
    const template = makeTemplate({
      frequency: 'weekly',
      weeklyDays: [5], // Friday
      leadTimeDays: 3,
    });
    // Today is Wednesday 2024-01-10, Friday is 2 days away (within window of 3)
    expect(getOccurrencesInWindow(template, new Date(2024, 0, 10))).toEqual([
      '2024-01-12',
    ]);
  });

  it('leadTimeDays 3 does NOT return occurrence 5 days away', () => {
    const template = makeTemplate({
      frequency: 'weekly',
      weeklyDays: [1], // Monday
      leadTimeDays: 3,
    });
    // Today is Wednesday 2024-01-10, next Monday is 5 days away (outside window of 3)
    expect(getOccurrencesInWindow(template, new Date(2024, 0, 10))).toEqual([]);
  });

  it('returned dateKey is the occurrence date, not today', () => {
    const template = makeTemplate({
      frequency: 'weekly',
      weeklyDays: [5], // Friday
      leadTimeDays: 5,
    });
    // Today is Monday 2024-01-08, Friday occurrence is 4 days away
    const result = getOccurrencesInWindow(template, new Date(2024, 0, 8));
    expect(result).toEqual(['2024-01-12']); // Friday's date, not Monday's
  });

  it('respects interval matching on the occurrence date', () => {
    const template = makeTemplate({
      frequency: 'weekly',
      weeklyDays: [5], // Friday
      leadTimeDays: 5,
      interval: 2, // every 2 weeks
      startDate: '2024-01-05', // First Friday
    });
    // Week of Jan 8: this is week 1 from start (interval 2, so next is week 2 = Jan 19)
    // Today is Mon Jan 8, Friday Jan 12 is 4 days away but is in week 1 (not interval match for bi-weekly)
    // Actually let me check: startDate is 2024-01-05 (Friday), interval=2
    // Jan 12 is 7 days later = 1 week. 1 % 2 != 0 → no match
    expect(getOccurrencesInWindow(template, new Date(2024, 0, 8))).toEqual([]);

    // Today is Mon Jan 15, Friday Jan 19 is 4 days away, which is 14 days from start = 2 weeks. 2 % 2 == 0 → match
    expect(getOccurrencesInWindow(template, new Date(2024, 0, 15))).toEqual([
      '2024-01-19',
    ]);
  });

  it('respects startDate gating', () => {
    const template = makeTemplate({
      frequency: 'weekly',
      weeklyDays: [5], // Friday
      leadTimeDays: 5,
      startDate: '2024-01-15', // Starts after the Friday we're checking
    });
    // Today is Mon Jan 8, Friday Jan 12 is within lead window but before startDate
    expect(getOccurrencesInWindow(template, new Date(2024, 0, 8))).toEqual([]);
  });

  it('multiple weeklyDays within lead window returns all matching dateKeys', () => {
    const template = makeTemplate({
      frequency: 'weekly',
      weeklyDays: [3, 5], // Wednesday, Friday
      leadTimeDays: 7,
    });
    // Today is Monday 2024-01-08, lead window covers Mon-Mon (8-15)
    // Wednesday Jan 10 is 2 days away → match
    // Friday Jan 12 is 4 days away → match
    const result = getOccurrencesInWindow(template, new Date(2024, 0, 8));
    expect(result).toEqual(['2024-01-10', '2024-01-12']);
  });

  it('leadTimeDays 7 edge case — full week window', () => {
    const template = makeTemplate({
      frequency: 'weekly',
      weeklyDays: [1], // Monday
      leadTimeDays: 7,
    });
    // Today is Tuesday 2024-01-09, next Monday is Jan 15 = 6 days away (within 7)
    expect(getOccurrencesInWindow(template, new Date(2024, 0, 9))).toEqual([
      '2024-01-15',
    ]);
    // Today is Monday 2024-01-08 — offset 0 matches (Jan 8), offset 7 also matches (Jan 15)
    expect(getOccurrencesInWindow(template, new Date(2024, 0, 8))).toEqual([
      '2024-01-08',
      '2024-01-15',
    ]);
  });

  it('leadTimeDays 7 returns occurrence exactly 7 days away', () => {
    const template = makeTemplate({
      frequency: 'weekly',
      weeklyDays: [2], // Tuesday
      leadTimeDays: 7,
    });
    // Today is Tuesday 2024-01-09, next Tuesday is Jan 16 = exactly 7 days away
    expect(getOccurrencesInWindow(template, new Date(2024, 0, 9))).toEqual([
      '2024-01-09',
      '2024-01-16',
    ]);
  });
});
