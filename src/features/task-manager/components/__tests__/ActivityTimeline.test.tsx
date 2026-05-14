import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ActivityTimeline } from '../ActivityTimeline';
import type { ActivityEvent } from '../../types/activity.types';

function makeEvent(overrides: Partial<ActivityEvent> = {}): ActivityEvent {
  return {
    id: crypto.randomUUID(),
    taskId: crypto.randomUUID(),
    eventType: 'task_created',
    fromValue: null,
    toValue: null,
    metadata: {},
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('ActivityTimeline', () => {
  it('renders loading skeleton with aria-label', () => {
    render(<ActivityTimeline events={[]} isLoading />);

    const section = screen.getByLabelText('Activity');
    expect(section).toBeInTheDocument();

    const skeletons = section.querySelectorAll('.animate-pulse');
    expect(skeletons).toHaveLength(3);
  });

  it('renders empty state when no events', () => {
    render(<ActivityTimeline events={[]} />);

    expect(screen.getByText('No activity yet')).toBeInTheDocument();
  });

  it('renders events as list items', () => {
    const events = [makeEvent({ id: 'e-1' }), makeEvent({ id: 'e-2' })];
    render(<ActivityTimeline events={events} />);

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
  });

  it('renders event description text', () => {
    render(<ActivityTimeline events={[makeEvent()]} />);

    expect(screen.getByText('Task created')).toBeInTheDocument();
  });

  it('renders time elements with dateTime attribute', () => {
    const createdAt = '2026-05-14T12:00:00.000Z';
    render(<ActivityTimeline events={[makeEvent({ createdAt })]} />);

    const time = screen.getByRole('time');
    expect(time).toHaveAttribute('dateTime', createdAt);
  });

  it('has section with aria-label="Activity"', () => {
    render(<ActivityTimeline events={[makeEvent()]} />);

    expect(screen.getByLabelText('Activity')).toBeInTheDocument();
  });

  it('renders "Activity" heading', () => {
    render(<ActivityTimeline events={[makeEvent()]} />);

    expect(
      screen.getByRole('heading', { name: 'Activity' }),
    ).toBeInTheDocument();
  });
});
