import { supabase } from '../services/supabase';
import type { AnalyticsEventName } from './analytics.types';

const sessionId = crypto.randomUUID();

function isOptedOut(): boolean {
  try {
    return localStorage.getItem('taskops.analytics.optOut') === 'true';
  } catch {
    return false;
  }
}

export function trackEvent(
  eventName: AnalyticsEventName,
  metadata: Record<string, unknown> = {},
): void {
  if (import.meta.env.VITE_ANALYTICS_ENABLED !== 'true') return;
  if (isOptedOut()) return;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (supabase as any)
    .from('analytics_events')
    .insert({
      event_name: eventName,
      session_id: sessionId,
      metadata,
    })
    .then(({ error }: { error: unknown }) => {
      if (error && import.meta.env.DEV) {
        console.warn('[Analytics]', eventName, error);
      }
    })
    .catch(() => {
      // Silently swallow — analytics must never affect UX
    });
}
