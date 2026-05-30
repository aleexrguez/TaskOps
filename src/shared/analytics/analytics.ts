import { supabase } from '../services/supabase';
import type { AnalyticsEventName } from './analytics.types';

const sessionId = crypto.randomUUID();

export function trackEvent(
  eventName: AnalyticsEventName,
  metadata: Record<string, unknown> = {},
): void {
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
