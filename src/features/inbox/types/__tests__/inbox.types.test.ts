import { describe, it, expect } from 'vitest';
import {
  createInboxItemInputSchema,
  updateInboxItemInputSchema,
} from '../inbox.types';

describe('createInboxItemInputSchema', () => {
  it('accepts valid title', () => {
    const result = createInboxItemInputSchema.safeParse({ title: 'Buy milk' });
    expect(result.success).toBe(true);
    expect(result.data!.title).toBe('Buy milk');
  });

  it('trims whitespace from title', () => {
    const result = createInboxItemInputSchema.safeParse({
      title: '  Hello  ',
    });
    expect(result.success).toBe(true);
    expect(result.data!.title).toBe('Hello');
  });

  it('rejects empty title', () => {
    const result = createInboxItemInputSchema.safeParse({ title: '' });
    expect(result.success).toBe(false);
  });

  it('rejects whitespace-only title (trim makes it empty)', () => {
    const result = createInboxItemInputSchema.safeParse({ title: '   ' });
    expect(result.success).toBe(false);
  });

  it('rejects title > 200 chars', () => {
    const result = createInboxItemInputSchema.safeParse({
      title: 'a'.repeat(201),
    });
    expect(result.success).toBe(false);
  });

  it('accepts title exactly 200 chars', () => {
    const result = createInboxItemInputSchema.safeParse({
      title: 'a'.repeat(200),
    });
    expect(result.success).toBe(true);
  });

  it('accepts notes as string', () => {
    const result = createInboxItemInputSchema.safeParse({
      title: 'Idea',
      notes: 'Some details',
    });
    expect(result.success).toBe(true);
    expect(result.data!.notes).toBe('Some details');
  });

  it('rejects notes > 2000 chars', () => {
    const result = createInboxItemInputSchema.safeParse({
      title: 'Idea',
      notes: 'x'.repeat(2001),
    });
    expect(result.success).toBe(false);
  });

  it('accepts notes as null', () => {
    const result = createInboxItemInputSchema.safeParse({
      title: 'Idea',
      notes: null,
    });
    expect(result.success).toBe(true);
    expect(result.data!.notes).toBeNull();
  });

  it('accepts notes as undefined (normalizes to null)', () => {
    const result = createInboxItemInputSchema.safeParse({ title: 'Idea' });
    expect(result.success).toBe(true);
    expect(result.data!.notes).toBeNull();
  });

  it('normalizes empty string notes to null', () => {
    const result = createInboxItemInputSchema.safeParse({
      title: 'Idea',
      notes: '',
    });
    expect(result.success).toBe(true);
    expect(result.data!.notes).toBeNull();
  });
});

describe('updateInboxItemInputSchema', () => {
  it('accepts partial update with title only', () => {
    const result = updateInboxItemInputSchema.safeParse({
      title: 'New title',
    });
    expect(result.success).toBe(true);
    expect(result.data!.title).toBe('New title');
    expect(result.data!.notes).toBeUndefined();
  });

  it('accepts partial update with notes only', () => {
    const result = updateInboxItemInputSchema.safeParse({
      notes: 'Updated notes',
    });
    expect(result.success).toBe(true);
    expect(result.data!.notes).toBe('Updated notes');
    expect(result.data!.title).toBeUndefined();
  });

  it('rejects title < 1 char when provided', () => {
    const result = updateInboxItemInputSchema.safeParse({ title: '' });
    expect(result.success).toBe(false);
  });

  it('rejects title > 200 chars when provided', () => {
    const result = updateInboxItemInputSchema.safeParse({
      title: 'a'.repeat(201),
    });
    expect(result.success).toBe(false);
  });

  it('accepts notes as null (to clear)', () => {
    const result = updateInboxItemInputSchema.safeParse({ notes: null });
    expect(result.success).toBe(true);
    expect(result.data!.notes).toBeNull();
  });

  it('accepts empty object (no changes)', () => {
    const result = updateInboxItemInputSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});
