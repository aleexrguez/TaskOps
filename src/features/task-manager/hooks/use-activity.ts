import { useQuery } from '@tanstack/react-query';
import { fetchActivityEvents } from '../api';
import { useAuth } from '@/features/auth/hooks';
import { activityKeys } from './activity.keys';

export function useActivityEvents(taskId: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: activityKeys.list(taskId),
    queryFn: () => fetchActivityEvents(taskId),
    enabled: !!user && !!taskId,
    staleTime: 30_000,
  });
}
