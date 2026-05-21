import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, afterAll } from 'vitest';
import i18n from '@/i18n/i18n';
import { TaskForm } from '../TaskForm';
import { TaskCard } from '../TaskCard';
import type { Task } from '../../types';

const mockTask: Task = {
  id: 'i18n-test-001',
  title: 'Test Task',
  status: 'in-progress',
  priority: 'high',
  isArchived: false,
  position: 0,
  createdAt: '2026-04-01T10:00:00.000Z',
  updatedAt: '2026-04-01T10:00:00.000Z',
};

afterAll(async () => {
  await i18n.changeLanguage('en');
});

describe('TaskForm i18n', () => {
  it('renders labels in Spanish when language is es', async () => {
    await act(async () => {
      await i18n.changeLanguage('es');
    });

    render(<TaskForm onSubmit={() => {}} submitLabel="Crear tarea" />);

    expect(screen.getByLabelText(/Titulo/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Descripcion/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Estado/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Prioridad/)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Crear tarea/ }),
    ).toBeInTheDocument();
  });
});

describe('TaskCard i18n', () => {
  it('renders status and priority labels in Spanish when language is es', async () => {
    await act(async () => {
      await i18n.changeLanguage('es');
    });

    render(<TaskCard task={mockTask} />);

    expect(screen.getByText('En progreso')).toBeInTheDocument();
    expect(screen.getByText('Alta')).toBeInTheDocument();
    expect(screen.getByText(/Creada/)).toBeInTheDocument();
  });
});
