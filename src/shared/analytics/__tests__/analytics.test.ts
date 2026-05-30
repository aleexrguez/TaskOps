import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/shared/services/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { supabase } from '@/shared/services/supabase';
import { trackEvent } from '../analytics';

function flushPromises(): Promise<void> {
  return new Promise((r) => setTimeout(r, 0));
}

let originalEnv: string | undefined;

beforeEach(() => {
  vi.mocked(supabase.from).mockReset();
  originalEnv = import.meta.env.VITE_ANALYTICS_ENABLED;
  import.meta.env.VITE_ANALYTICS_ENABLED = 'true';
  localStorage.removeItem('taskops.analytics.optOut');
});

afterEach(() => {
  if (originalEnv === undefined) {
    delete import.meta.env.VITE_ANALYTICS_ENABLED;
  } else {
    import.meta.env.VITE_ANALYTICS_ENABLED = originalEnv;
  }
});

describe('trackEvent', () => {
  it('inserts into analytics_events with correct shape', async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as never);

    trackEvent('task_created', { source: 'form' });
    await flushPromises();

    expect(supabase.from).toHaveBeenCalledWith('analytics_events');
    expect(mockInsert).toHaveBeenCalledWith({
      event_name: 'task_created',
      session_id: expect.any(String),
      metadata: { source: 'form' },
    });
  });

  it('does not include user_id in the insert payload', async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as never);

    trackEvent('landing_viewed');
    await flushPromises();

    const payload = mockInsert.mock.calls[0][0];
    expect(payload).not.toHaveProperty('user_id');
  });

  it('uses the same session_id across calls', async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as never);

    trackEvent('landing_viewed');
    trackEvent('demo_started');
    await flushPromises();

    const firstId = mockInsert.mock.calls[0][0].session_id;
    const secondId = mockInsert.mock.calls[1][0].session_id;
    expect(firstId).toBe(secondId);
    expect(firstId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  it('defaults metadata to empty object when omitted', async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as never);

    trackEvent('board_viewed');
    await flushPromises();

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ metadata: {} }),
    );
  });

  it('swallows insert errors silently', async () => {
    const mockInsert = vi.fn().mockRejectedValue(new Error('network fail'));
    vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as never);

    expect(() => trackEvent('task_created')).not.toThrow();
    await flushPromises();
  });

  it('does not insert when VITE_ANALYTICS_ENABLED is not true', async () => {
    import.meta.env.VITE_ANALYTICS_ENABLED = '';

    trackEvent('task_created');
    await flushPromises();

    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('does not insert when opt-out is set in localStorage', async () => {
    localStorage.setItem('taskops.analytics.optOut', 'true');

    trackEvent('task_created');
    await flushPromises();

    expect(supabase.from).not.toHaveBeenCalled();
  });
});
