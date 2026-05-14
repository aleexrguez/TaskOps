export const activityKeys = {
  all: ['activity'] as const,
  lists: () => [...activityKeys.all, 'list'] as const,
  list: (taskId: string) => [...activityKeys.lists(), taskId] as const,
};
