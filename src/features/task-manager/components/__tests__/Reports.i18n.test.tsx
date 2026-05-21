import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, afterAll } from 'vitest';
import i18n from '@/i18n/i18n';
import { WeeklyReportView } from '../WeeklyReportView';
import type { WeeklyReportData, Task } from '../../types';

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
  stuckTasks: [],
  overdueTasks: [],
};

afterAll(async () => {
  await i18n.changeLanguage('en');
});

describe('Reports i18n', () => {
  it('renders card labels in Spanish when language is es', async () => {
    await act(async () => {
      await i18n.changeLanguage('es');
    });

    render(<WeeklyReportView report={weeklyReport} />);

    expect(screen.getByText('Completadas')).toBeInTheDocument();
    expect(screen.getByText('Creadas')).toBeInTheDocument();
    expect(screen.getByText('En progreso')).toBeInTheDocument();
    expect(screen.getByText('Vencidas')).toBeInTheDocument();
    expect(screen.getByText('Recurrentes')).toBeInTheDocument();
  });
});
