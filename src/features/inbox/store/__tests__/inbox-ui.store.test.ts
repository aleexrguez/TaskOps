import { describe, it, expect, beforeEach } from 'vitest';
import { useInboxUIStore } from '../inbox-ui.store';

describe('inbox-ui.store', () => {
  beforeEach(() => {
    useInboxUIStore.getState().reset();
  });

  it('initializes with null ids', () => {
    const state = useInboxUIStore.getState();
    expect(state.editingItemId).toBeNull();
    expect(state.convertingItemId).toBeNull();
  });

  it('setEditingItem sets the editing id', () => {
    useInboxUIStore.getState().setEditingItem('item-1');
    expect(useInboxUIStore.getState().editingItemId).toBe('item-1');
  });

  it('setEditingItem clears with null', () => {
    useInboxUIStore.getState().setEditingItem('item-1');
    useInboxUIStore.getState().setEditingItem(null);
    expect(useInboxUIStore.getState().editingItemId).toBeNull();
  });

  it('setConvertingItem sets the converting id', () => {
    useInboxUIStore.getState().setConvertingItem('item-2');
    expect(useInboxUIStore.getState().convertingItemId).toBe('item-2');
  });

  it('setConvertingItem clears with null', () => {
    useInboxUIStore.getState().setConvertingItem('item-2');
    useInboxUIStore.getState().setConvertingItem(null);
    expect(useInboxUIStore.getState().convertingItemId).toBeNull();
  });

  it('reset clears both ids', () => {
    useInboxUIStore.getState().setEditingItem('item-1');
    useInboxUIStore.getState().setConvertingItem('item-2');
    useInboxUIStore.getState().reset();

    const state = useInboxUIStore.getState();
    expect(state.editingItemId).toBeNull();
    expect(state.convertingItemId).toBeNull();
  });

  it('does not store server state (only UI ids)', () => {
    const state = useInboxUIStore.getState();
    const keys = Object.keys(state);
    expect(keys).not.toContain('items');
    expect(keys).not.toContain('inboxItems');
    expect(keys).not.toContain('data');
  });
});
