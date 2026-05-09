import type { ChecklistItem } from '@/features/task-manager/types/checklist.types';

const CHECKLIST_ITEM_DEFAULTS: ChecklistItem = {
  id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
  taskId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  title: 'Factory Checklist Item',
  isCompleted: false,
  position: 0,
  createdAt: '2026-05-07T10:00:00.000Z',
  updatedAt: '2026-05-07T10:00:00.000Z',
};

export function createMockChecklistItem(
  overrides: Partial<ChecklistItem> = {},
): ChecklistItem {
  return { ...CHECKLIST_ITEM_DEFAULTS, ...overrides };
}
