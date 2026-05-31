import type { TaskStatus } from '../types';

const ALL_STATUSES: TaskStatus[] = ['todo', 'in-progress', 'done'];

export function getAvailableStatusTransitions(
  current: TaskStatus,
): TaskStatus[] {
  return ALL_STATUSES.filter((s) => s !== current);
}
