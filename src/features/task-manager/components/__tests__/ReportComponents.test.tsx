import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ReportTaskSection } from '../ReportTaskSection';
import { ReportSummaryCards } from '../ReportSummaryCards';
import { WeeklyReportView } from '../WeeklyReportView';
import { MonthlyReportView } from '../MonthlyReportView';
import type { Task } from '../../types';
import type { WeeklyReportData, MonthlyReportData } from '../../types';

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: crypto.randomUUID(),
    title: 'Test Task',
    status: 'todo',
    priority: 'medium',
    isArchived: false,
    position: 0,
    createdAt: '2026-05-13T10:00:00.000Z',
    updatedAt: '2026-05-13T10:00:00.000Z',
    ...overrides,
  };
}

const weeklyReport: WeeklyReportData = {
  period: {
    startIso: '2026-05-11T00:00:00.000',
    endIso: '2026-05-17T23:59:59.999',
    label: 'May 11 – May 17, 2026',
  },
  summary: {
    tasksCompleted: 5,
    tasksCreated: 3,
    tasksInProgress: 2,
    tasksOverdue: 1,
    checklistItemsCompleted: 4,
    recurringTasksCompleted: 2,
  },
  completedTasks: [
    makeTask({ status: 'done', completedAt: '2026-05-13T10:00:00.000Z' }),
  ],
  createdTasks: [makeTask()],
  stuckTasks: [
    makeTask({ status: 'in-progress', createdAt: '2026-04-01T10:00:00.000Z' }),
  ],
  overdueTasks: [makeTask({ status: 'todo', dueDate: '2026-05-10' })],
};

const monthlyReport: MonthlyReportData = {
  period: {
    startIso: '2026-05-01T00:00:00.000',
    endIso: '2026-05-31T23:59:59.999',
    label: 'May 2026',
  },
  summary: {
    tasksCompleted: 12,
    tasksCreated: 18,
    checklistItemsCompleted: 9,
    recurringTasksCompleted: 5,
  },
  stuckTasks: [
    makeTask({ status: 'in-progress', createdAt: '2026-04-01T10:00:00.000Z' }),
  ],
  longestRunningTasks: [
    makeTask({ status: 'in-progress', createdAt: '2026-03-15T10:00:00.000Z' }),
  ],
  completedByDay: [
    { date: '2026-05-01', count: 0 },
    { date: '2026-05-02', count: 3 },
    { date: '2026-05-03', count: 0 },
    { date: '2026-05-04', count: 5 },
  ],
  completedByPriority: { high: 4, medium: 6, low: 2 },
};

// ─── ReportTaskSection ───────────────────────────────────────────────────────

describe('ReportTaskSection', () => {
  it('renders title and task count', () => {
    const tasks = [makeTask(), makeTask()];
    render(<ReportTaskSection title="Completed Tasks" tasks={tasks} />);

    expect(screen.getByText('Completed Tasks')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows empty message when no tasks', () => {
    render(
      <ReportTaskSection
        title="Completed Tasks"
        tasks={[]}
        emptyMessage="Nothing here yet"
      />,
    );

    expect(screen.getByText('Nothing here yet')).toBeInTheDocument();
  });

  it('shows default empty message when emptyMessage is not provided', () => {
    render(<ReportTaskSection title="Completed Tasks" tasks={[]} />);

    expect(screen.getByText('No tasks in this section')).toBeInTheDocument();
  });

  it('renders task titles', () => {
    const tasks = [
      makeTask({ title: 'First Task' }),
      makeTask({ title: 'Second Task' }),
    ];
    render(<ReportTaskSection title="Section" tasks={tasks} />);

    expect(screen.getByText('First Task')).toBeInTheDocument();
    expect(screen.getByText('Second Task')).toBeInTheDocument();
  });

  it('renders renderExtra content for each task', () => {
    const tasks = [makeTask({ title: 'My Task' })];
    render(
      <ReportTaskSection
        title="Section"
        tasks={tasks}
        renderExtra={() => <span data-testid="extra-content">Extra Info</span>}
      />,
    );

    expect(screen.getByTestId('extra-content')).toBeInTheDocument();
    expect(screen.getByText('Extra Info')).toBeInTheDocument();
  });
});

// ─── ReportSummaryCards ──────────────────────────────────────────────────────

describe('ReportSummaryCards', () => {
  it('renders all cards with labels and values', () => {
    const cards = [
      { label: 'Completed', value: 5, className: 'bg-green-50' },
      { label: 'Created', value: 3, className: 'bg-blue-50' },
      { label: 'In Progress', value: 2, className: 'bg-amber-50' },
    ];
    render(<ReportSummaryCards cards={cards} />);

    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});

// ─── WeeklyReportView ────────────────────────────────────────────────────────

describe('WeeklyReportView', () => {
  it('renders period label and all task sections', () => {
    render(<WeeklyReportView report={weeklyReport} />);

    expect(screen.getByText('May 11 – May 17, 2026')).toBeInTheDocument();
    // Section headings
    expect(screen.getByText('Completed Tasks')).toBeInTheDocument();
    expect(screen.getByText('Created This Week')).toBeInTheDocument();
    expect(screen.getByText('Stuck — Open for Many Days')).toBeInTheDocument();
    expect(screen.getByText('Overdue Tasks')).toBeInTheDocument();
    // Unique summary values
    expect(screen.getByText('5')).toBeInTheDocument(); // tasksCompleted
    expect(screen.getByText('4')).toBeInTheDocument(); // checklistItemsCompleted
  });
});

// ─── MonthlyReportView ───────────────────────────────────────────────────────

describe('MonthlyReportView', () => {
  it('renders completed by priority values', () => {
    render(<MonthlyReportView report={monthlyReport} />);

    expect(screen.getByText('4')).toBeInTheDocument(); // high
    expect(screen.getByText('6')).toBeInTheDocument(); // medium
    expect(screen.getByText('2')).toBeInTheDocument(); // low (also matches low in completedByPriority)
  });

  it('renders completed by day bars for non-zero days', () => {
    render(<MonthlyReportView report={monthlyReport} />);

    // Days with count > 0 should appear; zero-count days are hidden
    expect(screen.getByText('May 2')).toBeInTheDocument();
    expect(screen.getByText('May 4')).toBeInTheDocument();
    expect(screen.queryByText('May 1')).not.toBeInTheDocument();
    expect(screen.queryByText('May 3')).not.toBeInTheDocument();
  });
});
