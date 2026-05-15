import type { Task } from '../../types';
import type { ActivityEvent } from '../../types';
import {
  getDateRangeForPeriod,
  isInDateRange,
  getStuckTasks,
  getOverdueTasks,
  getTaskAge,
  countEventsByType,
  countCompletedByDay,
  countCompletedByPriority,
  buildWeeklyReport,
  buildMonthlyReport,
  LONGEST_RUNNING_LIMIT,
} from '../../utils';

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

let _idCounter = 0;

function makeTask(overrides: Partial<Task> = {}): Task {
  _idCounter += 1;
  return {
    id: `00000000-0000-0000-0000-${String(_idCounter).padStart(12, '0')}`,
    title: `Task ${_idCounter}`,
    status: 'todo',
    priority: 'medium',
    isArchived: false,
    position: 0,
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-01-10T10:00:00.000Z',
    ...overrides,
  };
}

function makeEvent(overrides: Partial<ActivityEvent> = {}): ActivityEvent {
  _idCounter += 1;
  return {
    id: `00000000-0000-0000-0001-${String(_idCounter).padStart(12, '0')}`,
    taskId: `00000000-0000-0000-0000-000000000001`,
    eventType: 'task_created',
    fromValue: null,
    toValue: null,
    metadata: {},
    createdAt: '2026-01-10T10:00:00.000Z',
    ...overrides,
  };
}

beforeEach(() => {
  _idCounter = 0;
});

// ---------------------------------------------------------------------------
// 1. getDateRangeForPeriod
// ---------------------------------------------------------------------------

describe('getDateRangeForPeriod', () => {
  // Thursday May 15, 2026
  const NOW = new Date(2026, 4, 15, 10, 0, 0);

  it('this-week: startIso is Monday 00:00:00.000, endIso is Sunday 23:59:59.999', () => {
    const range = getDateRangeForPeriod('this-week', NOW);

    expect(range.startIso).toBe('2026-05-11T00:00:00.000');
    expect(range.endIso).toBe('2026-05-17T23:59:59.999');
  });

  it('this-month: startIso is 1st 00:00:00.000, endIso is last day 23:59:59.999', () => {
    const range = getDateRangeForPeriod('this-month', NOW);

    expect(range.startIso).toBe('2026-05-01T00:00:00.000');
    expect(range.endIso).toBe('2026-05-31T23:59:59.999');
  });

  it('last-week: returns previous week (May 5 Monday to May 11 Sunday)', () => {
    const range = getDateRangeForPeriod('last-week', NOW);

    expect(range.startIso).toBe('2026-05-04T00:00:00.000');
    expect(range.endIso).toBe('2026-05-10T23:59:59.999');
  });

  it('last-month: returns previous month (April 1 to April 30)', () => {
    const range = getDateRangeForPeriod('last-month', NOW);

    expect(range.startIso).toBe('2026-04-01T00:00:00.000');
    expect(range.endIso).toBe('2026-04-30T23:59:59.999');
  });

  it('label contains formatted start and end dates for this-week', () => {
    const range = getDateRangeForPeriod('this-week', NOW);

    expect(range.label).toContain('May 11');
    expect(range.label).toContain('May 17');
  });

  it('label contains formatted start and end dates for this-month', () => {
    const range = getDateRangeForPeriod('this-month', NOW);

    expect(range.label).toContain('May 1');
    expect(range.label).toContain('May 31');
  });
});

// ---------------------------------------------------------------------------
// 2. isInDateRange
// ---------------------------------------------------------------------------

describe('isInDateRange', () => {
  const range = {
    startIso: '2026-05-11T00:00:00.000',
    endIso: '2026-05-17T23:59:59.999',
    label: 'May 11 – May 17, 2026',
  };

  it('returns true for timestamp at start boundary', () => {
    expect(isInDateRange('2026-05-11T00:00:00.000', range)).toBe(true);
  });

  it('returns true for timestamp at end boundary', () => {
    expect(isInDateRange('2026-05-17T23:59:59.999', range)).toBe(true);
  });

  it('returns true for timestamp in middle of range', () => {
    expect(isInDateRange('2026-05-14T12:00:00.000', range)).toBe(true);
  });

  it('returns false for timestamp before range', () => {
    expect(isInDateRange('2026-05-10T23:59:59.999', range)).toBe(false);
  });

  it('returns false for timestamp after range', () => {
    expect(isInDateRange('2026-05-18T00:00:00.000', range)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 3. getStuckTasks
// ---------------------------------------------------------------------------

describe('getStuckTasks', () => {
  // May 15, 2026
  const NOW = new Date(2026, 4, 15, 10, 0, 0);

  it('returns in-progress tasks created more than threshold days ago', () => {
    const stuck = makeTask({
      status: 'in-progress',
      createdAt: '2026-05-01T10:00:00.000Z', // 14 days ago
    });

    const result = getStuckTasks([stuck], 7, NOW);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(stuck.id);
  });

  it('excludes todo tasks', () => {
    const todo = makeTask({
      status: 'todo',
      createdAt: '2026-04-01T10:00:00.000Z',
    });

    expect(getStuckTasks([todo], 7, NOW)).toHaveLength(0);
  });

  it('excludes done tasks', () => {
    const done = makeTask({
      status: 'done',
      createdAt: '2026-04-01T10:00:00.000Z',
    });

    expect(getStuckTasks([done], 7, NOW)).toHaveLength(0);
  });

  it('excludes in-progress tasks created less than threshold days ago', () => {
    const recent = makeTask({
      status: 'in-progress',
      createdAt: '2026-05-13T10:00:00.000Z', // 2 days ago
    });

    expect(getStuckTasks([recent], 7, NOW)).toHaveLength(0);
  });

  it('excludes in-progress tasks created exactly at threshold days ago (not strictly greater)', () => {
    // exactly 7 days ago — should NOT be included (must be > threshold)
    const boundary = makeTask({
      status: 'in-progress',
      createdAt: '2026-05-08T10:00:00.000Z', // exactly 7 days ago
    });

    expect(getStuckTasks([boundary], 7, NOW)).toHaveLength(0);
  });

  it('returns empty array when no stuck tasks', () => {
    expect(getStuckTasks([], 7, NOW)).toHaveLength(0);
  });

  it('sorts by createdAt ascending (oldest first)', () => {
    const newer = makeTask({
      status: 'in-progress',
      createdAt: '2026-05-01T10:00:00.000Z',
    });
    const older = makeTask({
      status: 'in-progress',
      createdAt: '2026-04-15T10:00:00.000Z',
    });

    const result = getStuckTasks([newer, older], 7, NOW);

    expect(result[0].id).toBe(older.id);
    expect(result[1].id).toBe(newer.id);
  });
});

// ---------------------------------------------------------------------------
// 4. getOverdueTasks
// ---------------------------------------------------------------------------

describe('getOverdueTasks', () => {
  // May 15, 2026
  const NOW = new Date(2026, 4, 15, 10, 0, 0);

  it('returns tasks with dueDate before today that are not done', () => {
    const overdue = makeTask({
      status: 'todo',
      dueDate: '2026-05-10',
    });

    const result = getOverdueTasks([overdue], NOW);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(overdue.id);
  });

  it('returns in-progress tasks with past dueDate', () => {
    const overdue = makeTask({
      status: 'in-progress',
      dueDate: '2026-05-01',
    });

    expect(getOverdueTasks([overdue], NOW)).toHaveLength(1);
  });

  it('excludes done tasks even if dueDate is past', () => {
    const done = makeTask({
      status: 'done',
      dueDate: '2026-05-01',
    });

    expect(getOverdueTasks([done], NOW)).toHaveLength(0);
  });

  it('excludes tasks with no dueDate', () => {
    const noDueDate = makeTask({ status: 'todo' });

    expect(getOverdueTasks([noDueDate], NOW)).toHaveLength(0);
  });

  it('excludes tasks with dueDate equal to today (today is NOT overdue)', () => {
    const dueToday = makeTask({
      status: 'todo',
      dueDate: '2026-05-15',
    });

    expect(getOverdueTasks([dueToday], NOW)).toHaveLength(0);
  });

  it('excludes tasks with dueDate in the future', () => {
    const future = makeTask({
      status: 'todo',
      dueDate: '2026-06-01',
    });

    expect(getOverdueTasks([future], NOW)).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 5. getTaskAge
// ---------------------------------------------------------------------------

describe('getTaskAge', () => {
  it('returns correct number of days', () => {
    // Use local dates converted to ISO for timezone safety
    const task = makeTask({
      createdAt: new Date(2026, 4, 1, 10, 0, 0).toISOString(),
    });
    const now = new Date(2026, 4, 15, 10, 0, 0);

    expect(getTaskAge(task, now)).toBe(14);
  });

  it('returns 0 for a task created today', () => {
    const task = makeTask({
      createdAt: new Date(2026, 4, 15, 8, 0, 0).toISOString(),
    });
    const now = new Date(2026, 4, 15, 10, 0, 0);

    expect(getTaskAge(task, now)).toBe(0);
  });

  it('returns 1 for a task created yesterday', () => {
    const task = makeTask({
      createdAt: new Date(2026, 4, 14, 10, 0, 0).toISOString(),
    });
    const now = new Date(2026, 4, 15, 10, 0, 0);

    expect(getTaskAge(task, now)).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// 6. countEventsByType
// ---------------------------------------------------------------------------

describe('countEventsByType', () => {
  it('counts only events of specified type', () => {
    const events = [
      makeEvent({ eventType: 'checklist_item_completed' }),
      makeEvent({ eventType: 'checklist_item_completed' }),
      makeEvent({ eventType: 'task_created' }),
    ];

    expect(countEventsByType(events, 'checklist_item_completed')).toBe(2);
  });

  it('returns 0 when no matching events', () => {
    const events = [makeEvent({ eventType: 'task_created' })];

    expect(countEventsByType(events, 'checklist_item_completed')).toBe(0);
  });

  it('returns 0 for empty array', () => {
    expect(countEventsByType([], 'task_created')).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 7. countCompletedByDay
// ---------------------------------------------------------------------------

describe('countCompletedByDay', () => {
  const range = {
    startIso: '2026-05-11T00:00:00.000',
    endIso: '2026-05-17T23:59:59.999',
    label: 'May 11 – May 17, 2026',
  };

  it('groups tasks by completedAt date', () => {
    const tasks = [
      makeTask({ completedAt: '2026-05-12T10:00:00.000Z', status: 'done' }),
      makeTask({ completedAt: '2026-05-12T15:00:00.000Z', status: 'done' }),
      makeTask({ completedAt: '2026-05-14T09:00:00.000Z', status: 'done' }),
    ];

    const result = countCompletedByDay(tasks, range);
    const may12 = result.find((r) => r.date === '2026-05-12');
    const may14 = result.find((r) => r.date === '2026-05-14');

    expect(may12?.count).toBe(2);
    expect(may14?.count).toBe(1);
  });

  it('fills zero-count days in range', () => {
    const tasks = [
      makeTask({ completedAt: '2026-05-11T10:00:00.000Z', status: 'done' }),
    ];

    const result = countCompletedByDay(tasks, range);

    expect(result).toHaveLength(7);
    const may13 = result.find((r) => r.date === '2026-05-13');
    expect(may13?.count).toBe(0);
  });

  it('returns sorted by date ascending', () => {
    const tasks = [
      makeTask({ completedAt: '2026-05-15T10:00:00.000Z', status: 'done' }),
      makeTask({ completedAt: '2026-05-12T10:00:00.000Z', status: 'done' }),
    ];

    const result = countCompletedByDay(tasks, range);

    expect(result[0].date).toBe('2026-05-11');
    expect(result[6].date).toBe('2026-05-17');
    expect(result.map((r) => r.date)).toEqual(
      [...result]
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((r) => r.date),
    );
  });

  it('returns all zero-count entries for empty task array', () => {
    const result = countCompletedByDay([], range);

    expect(result).toHaveLength(7);
    expect(result.every((r) => r.count === 0)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 8. countCompletedByPriority
// ---------------------------------------------------------------------------

describe('countCompletedByPriority', () => {
  it('counts by priority correctly', () => {
    const tasks = [
      makeTask({ priority: 'high' }),
      makeTask({ priority: 'high' }),
      makeTask({ priority: 'medium' }),
      makeTask({ priority: 'low' }),
    ];

    const result = countCompletedByPriority(tasks);

    expect(result.high).toBe(2);
    expect(result.medium).toBe(1);
    expect(result.low).toBe(1);
  });

  it('returns zeros for missing priorities', () => {
    const tasks = [makeTask({ priority: 'high' })];

    const result = countCompletedByPriority(tasks);

    expect(result.medium).toBe(0);
    expect(result.low).toBe(0);
  });

  it('returns all zeros for empty array', () => {
    const result = countCompletedByPriority([]);

    expect(result).toEqual({ high: 0, medium: 0, low: 0 });
  });
});

// ---------------------------------------------------------------------------
// 9. buildWeeklyReport
// ---------------------------------------------------------------------------

describe('buildWeeklyReport', () => {
  // Week of May 11–17, 2026
  const range = {
    startIso: '2026-05-11T00:00:00.000',
    endIso: '2026-05-17T23:59:59.999',
    label: 'May 11 – May 17, 2026',
  };
  // Friday May 15
  const NOW = new Date(2026, 4, 15, 10, 0, 0);

  it('counts completed tasks including archived ones', () => {
    const archived = makeTask({
      status: 'done',
      isArchived: true,
      completedAt: '2026-05-13T10:00:00.000Z',
    });

    const report = buildWeeklyReport([archived], [], range, NOW);

    expect(report.summary.tasksCompleted).toBe(1);
    expect(report.completedTasks).toHaveLength(1);
  });

  it('counts recurring tasks by recurrenceTemplateId presence', () => {
    const recurring = makeTask({
      status: 'done',
      completedAt: '2026-05-13T10:00:00.000Z',
      recurrenceTemplateId: '00000000-0000-0000-0000-000000000099',
    });
    const nonRecurring = makeTask({
      status: 'done',
      completedAt: '2026-05-14T10:00:00.000Z',
    });

    const report = buildWeeklyReport([recurring, nonRecurring], [], range, NOW);

    expect(report.summary.recurringTasksCompleted).toBe(1);
  });

  it('counts checklist items from activity events', () => {
    const events = [
      makeEvent({ eventType: 'checklist_item_completed' }),
      makeEvent({ eventType: 'checklist_item_completed' }),
      makeEvent({ eventType: 'task_created' }),
    ];

    const report = buildWeeklyReport([], events, range, NOW);

    expect(report.summary.checklistItemsCompleted).toBe(2);
  });

  it('counts stuck tasks filtered by 7-day threshold', () => {
    const stuck = makeTask({
      status: 'in-progress',
      createdAt: '2026-05-01T10:00:00.000Z', // 14 days before May 15
    });
    const fresh = makeTask({
      status: 'in-progress',
      createdAt: '2026-05-13T10:00:00.000Z', // 2 days before May 15
    });

    const report = buildWeeklyReport([stuck, fresh], [], range, NOW);

    expect(report.stuckTasks).toHaveLength(1);
    expect(report.stuckTasks[0].id).toBe(stuck.id);
  });

  it('overdue tasks exclude done tasks', () => {
    const overdueNotDone = makeTask({
      status: 'todo',
      dueDate: '2026-05-10',
    });
    const overdueDone = makeTask({
      status: 'done',
      dueDate: '2026-05-10',
    });

    const report = buildWeeklyReport(
      [overdueNotDone, overdueDone],
      [],
      range,
      NOW,
    );

    expect(report.overdueTasks).toHaveLength(1);
    expect(report.overdueTasks[0].id).toBe(overdueNotDone.id);
    expect(report.summary.tasksOverdue).toBe(1);
  });

  it('does not count tasks with completedAt outside range', () => {
    const outside = makeTask({
      status: 'done',
      completedAt: '2026-05-10T10:00:00.000Z', // May 10, before range
    });

    const report = buildWeeklyReport([outside], [], range, NOW);

    expect(report.summary.tasksCompleted).toBe(0);
    expect(report.completedTasks).toHaveLength(0);
  });

  it('empty data returns zero counts and empty arrays', () => {
    const report = buildWeeklyReport([], [], range, NOW);

    expect(report.summary.tasksCompleted).toBe(0);
    expect(report.summary.tasksCreated).toBe(0);
    expect(report.summary.tasksInProgress).toBe(0);
    expect(report.summary.tasksOverdue).toBe(0);
    expect(report.summary.checklistItemsCompleted).toBe(0);
    expect(report.summary.recurringTasksCompleted).toBe(0);
    expect(report.completedTasks).toHaveLength(0);
    expect(report.createdTasks).toHaveLength(0);
    expect(report.stuckTasks).toHaveLength(0);
    expect(report.overdueTasks).toHaveLength(0);
  });

  it('counts tasks created in the range', () => {
    const created = makeTask({
      createdAt: '2026-05-13T10:00:00.000Z',
    });
    const outside = makeTask({
      createdAt: '2026-05-09T10:00:00.000Z',
    });

    const report = buildWeeklyReport([created, outside], [], range, NOW);

    expect(report.summary.tasksCreated).toBe(1);
    expect(report.createdTasks).toHaveLength(1);
  });

  it('counts tasksInProgress as current snapshot, not range-filtered', () => {
    const inProgress = makeTask({
      status: 'in-progress',
      createdAt: '2026-01-01T10:00:00.000Z', // outside range
    });

    const report = buildWeeklyReport([inProgress], [], range, NOW);

    expect(report.summary.tasksInProgress).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// 10. buildMonthlyReport
// ---------------------------------------------------------------------------

describe('buildMonthlyReport', () => {
  // May 2026
  const range = {
    startIso: '2026-05-01T00:00:00.000',
    endIso: '2026-05-31T23:59:59.999',
    label: 'May 1 – May 31, 2026',
  };
  const NOW = new Date(2026, 4, 15, 10, 0, 0);

  it('completedByDay groups tasks correctly', () => {
    const tasks = [
      makeTask({
        status: 'done',
        completedAt: '2026-05-05T10:00:00.000Z',
      }),
      makeTask({
        status: 'done',
        completedAt: '2026-05-05T15:00:00.000Z',
      }),
      makeTask({
        status: 'done',
        completedAt: '2026-05-10T09:00:00.000Z',
      }),
    ];

    const report = buildMonthlyReport(tasks, [], range, NOW);
    const may5 = report.completedByDay.find((r) => r.date === '2026-05-05');
    const may10 = report.completedByDay.find((r) => r.date === '2026-05-10');

    expect(may5?.count).toBe(2);
    expect(may10?.count).toBe(1);
    expect(report.completedByDay).toHaveLength(31);
  });

  it('completedByPriority counts correctly', () => {
    const tasks = [
      makeTask({
        status: 'done',
        priority: 'high',
        completedAt: '2026-05-05T10:00:00.000Z',
      }),
      makeTask({
        status: 'done',
        priority: 'high',
        completedAt: '2026-05-06T10:00:00.000Z',
      }),
      makeTask({
        status: 'done',
        priority: 'low',
        completedAt: '2026-05-07T10:00:00.000Z',
      }),
    ];

    const report = buildMonthlyReport(tasks, [], range, NOW);

    expect(report.completedByPriority.high).toBe(2);
    expect(report.completedByPriority.medium).toBe(0);
    expect(report.completedByPriority.low).toBe(1);
  });

  it('longestRunningTasks sorted by createdAt ascending, limited to LONGEST_RUNNING_LIMIT', () => {
    const tasks = Array.from({ length: 7 }, (_, i) =>
      makeTask({
        status: 'in-progress',
        createdAt: `2026-0${i + 1}-01T10:00:00.000Z`,
      }),
    );

    const report = buildMonthlyReport(tasks, [], range, NOW);

    expect(report.longestRunningTasks).toHaveLength(LONGEST_RUNNING_LIMIT);
    // oldest first
    expect(report.longestRunningTasks[0].createdAt).toBe(
      '2026-01-01T10:00:00.000Z',
    );
  });

  it('stuck tasks filtered by 14-day threshold', () => {
    const stuck = makeTask({
      status: 'in-progress',
      createdAt: '2026-04-01T10:00:00.000Z', // well over 14 days before May 15
    });
    const notStuck = makeTask({
      status: 'in-progress',
      createdAt: '2026-05-13T10:00:00.000Z', // 2 days before May 15
    });

    const report = buildMonthlyReport([stuck, notStuck], [], range, NOW);

    expect(report.stuckTasks).toHaveLength(1);
    expect(report.stuckTasks[0].id).toBe(stuck.id);
  });

  it('empty data returns zero counts and empty arrays', () => {
    const report = buildMonthlyReport([], [], range, NOW);

    expect(report.summary.tasksCompleted).toBe(0);
    expect(report.summary.tasksCreated).toBe(0);
    expect(report.summary.checklistItemsCompleted).toBe(0);
    expect(report.summary.recurringTasksCompleted).toBe(0);
    expect(report.stuckTasks).toHaveLength(0);
    expect(report.longestRunningTasks).toHaveLength(0);
    expect(report.completedByDay).toHaveLength(31);
    expect(report.completedByDay.every((r) => r.count === 0)).toBe(true);
    expect(report.completedByPriority).toEqual({
      high: 0,
      medium: 0,
      low: 0,
    });
  });

  it('only counts tasks with completedAt inside the range', () => {
    // Use local dates to avoid UTC/local timezone mismatch at boundaries
    const outside = makeTask({
      status: 'done',
      completedAt: new Date(2026, 3, 30, 12, 0, 0).toISOString(), // April 30 local
    });
    const inside = makeTask({
      status: 'done',
      completedAt: new Date(2026, 4, 1, 10, 0, 0).toISOString(), // May 1 local
    });

    const report = buildMonthlyReport([outside, inside], [], range, NOW);

    expect(report.summary.tasksCompleted).toBe(1);
  });
});
