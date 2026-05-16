import { describe, it, expect } from 'vitest';
import { inboxKeys } from '../inbox.keys';

describe('inboxKeys', () => {
  it('generates stable all key', () => {
    expect(inboxKeys.all).toEqual(['inbox']);
  });

  it('generates stable lists key', () => {
    expect(inboxKeys.lists()).toEqual(['inbox', 'list']);
  });

  it('generates list key with filters', () => {
    expect(inboxKeys.list({ search: 'test' })).toEqual([
      'inbox',
      'list',
      { search: 'test' },
    ]);
  });

  it('generates stable details key', () => {
    expect(inboxKeys.details()).toEqual(['inbox', 'detail']);
  });

  it('generates detail key with id', () => {
    expect(inboxKeys.detail('abc-123')).toEqual(['inbox', 'detail', 'abc-123']);
  });
});
