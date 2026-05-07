export const checklistKeys = {
  all: ['checklist'] as const,
  lists: () => [...checklistKeys.all, 'list'] as const,
  list: (taskId: string) => [...checklistKeys.lists(), taskId] as const,
};
