import { useAuth } from '@/features/auth/hooks';

export function useIsDemoUser(): boolean {
  const { user } = useAuth();
  const demoEmail = import.meta.env.VITE_DEMO_EMAIL;
  return !!demoEmail && user?.email === demoEmail;
}
