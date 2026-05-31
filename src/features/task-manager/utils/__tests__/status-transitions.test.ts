import { describe, expect, it } from 'vitest';
import { getAvailableStatusTransitions } from '../status-transitions';

describe('getAvailableStatusTransitions', () => {
  it('returns in-progress and done for todo', () => {
    expect(getAvailableStatusTransitions('todo')).toEqual([
      'in-progress',
      'done',
    ]);
  });

  it('returns todo and done for in-progress', () => {
    expect(getAvailableStatusTransitions('in-progress')).toEqual([
      'todo',
      'done',
    ]);
  });

  it('returns todo and in-progress for done', () => {
    expect(getAvailableStatusTransitions('done')).toEqual([
      'todo',
      'in-progress',
    ]);
  });

  it('never includes the current status', () => {
    const statuses = ['todo', 'in-progress', 'done'] as const;
    for (const status of statuses) {
      expect(getAvailableStatusTransitions(status)).not.toContain(status);
    }
  });

  it('always returns exactly 2 elements', () => {
    const statuses = ['todo', 'in-progress', 'done'] as const;
    for (const status of statuses) {
      expect(getAvailableStatusTransitions(status)).toHaveLength(2);
    }
  });
});
