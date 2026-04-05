import type { Task, CreateTaskInput, UpdateTaskInput } from '../types';
import type { TaskListResponse } from './task.dto';
import { SEED_TASKS } from './mock-data';

const STORAGE_KEY = 'task-manager-tasks';

function delay(ms = 300 + Math.random() * 200): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function loadFromStorage(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as Task[];
    }
  } catch {
    // corrupted storage — fall through to seed data
  }
  return SEED_TASKS.map((t) => ({ ...t }));
}

function persist(tasks: Task[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

let store: Task[] = loadFromStorage();

export async function fetchTasks(): Promise<TaskListResponse> {
  await delay();
  return { tasks: [...store], total: store.length };
}

export async function fetchTaskById(id: string): Promise<Task> {
  await delay();
  const task = store.find((t) => t.id === id);
  if (!task) {
    throw new Error(`Task not found: ${id}`);
  }
  return { ...task };
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  await delay();
  const now = new Date().toISOString();
  const task: Task = {
    id: crypto.randomUUID(),
    title: input.title,
    description: input.description,
    status: input.status ?? 'todo',
    priority: input.priority ?? 'medium',
    assignee: input.assignee,
    createdAt: now,
    updatedAt: now,
  };
  store = [...store, task];
  persist(store);
  return { ...task };
}

export async function updateTask(
  id: string,
  input: UpdateTaskInput,
): Promise<Task> {
  await delay();
  const index = store.findIndex((t) => t.id === id);
  if (index === -1) {
    throw new Error(`Task not found: ${id}`);
  }
  const updated: Task = {
    ...store[index],
    ...input,
    updatedAt: new Date().toISOString(),
  };
  store = [...store.slice(0, index), updated, ...store.slice(index + 1)];
  persist(store);
  return { ...updated };
}

export async function deleteTask(id: string): Promise<void> {
  await delay();
  const exists = store.some((t) => t.id === id);
  if (!exists) {
    throw new Error(`Task not found: ${id}`);
  }
  store = store.filter((t) => t.id !== id);
  persist(store);
}
