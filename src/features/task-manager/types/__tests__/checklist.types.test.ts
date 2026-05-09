import { describe, it, expect } from 'vitest';
import {
  checklistItemSchema,
  createChecklistItemInputSchema,
  updateChecklistItemInputSchema,
  reorderChecklistItemSchema,
} from '../checklist.types';

// ---------------------------------------------------------------------------
// checklistItemSchema
// ---------------------------------------------------------------------------

describe('checklistItemSchema', () => {
  const validItem = {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    taskId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    title: 'Do the thing',
    isCompleted: false,
    position: 0,
    createdAt: '2026-05-07T10:00:00.000Z',
    updatedAt: '2026-05-07T10:00:00.000Z',
  };

  it('parses a valid checklist item', () => {
    expect(() => checklistItemSchema.parse(validItem)).not.toThrow();
  });

  it('rejects when id is not a uuid', () => {
    expect(() =>
      checklistItemSchema.parse({ ...validItem, id: 'not-a-uuid' }),
    ).toThrow();
  });

  it('rejects when taskId is not a uuid', () => {
    expect(() =>
      checklistItemSchema.parse({ ...validItem, taskId: 'not-a-uuid' }),
    ).toThrow();
  });

  it('rejects when title is empty', () => {
    expect(() =>
      checklistItemSchema.parse({ ...validItem, title: '' }),
    ).toThrow();
  });

  it('rejects when title exceeds 500 characters', () => {
    expect(() =>
      checklistItemSchema.parse({ ...validItem, title: 'a'.repeat(501) }),
    ).toThrow();
  });

  it('accepts title at exactly 500 characters', () => {
    expect(() =>
      checklistItemSchema.parse({ ...validItem, title: 'a'.repeat(500) }),
    ).not.toThrow();
  });

  it('accepts title at exactly 1 character', () => {
    expect(() =>
      checklistItemSchema.parse({ ...validItem, title: 'x' }),
    ).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// createChecklistItemInputSchema
// ---------------------------------------------------------------------------

describe('createChecklistItemInputSchema', () => {
  it('parses a valid input with title', () => {
    expect(() =>
      createChecklistItemInputSchema.parse({ title: 'New item' }),
    ).not.toThrow();
  });

  it('rejects when title is empty', () => {
    expect(() => createChecklistItemInputSchema.parse({ title: '' })).toThrow();
  });

  it('rejects when title exceeds 500 characters', () => {
    expect(() =>
      createChecklistItemInputSchema.parse({ title: 'a'.repeat(501) }),
    ).toThrow();
  });

  it('rejects when title is missing', () => {
    expect(() => createChecklistItemInputSchema.parse({})).toThrow();
  });
});

// ---------------------------------------------------------------------------
// updateChecklistItemInputSchema
// ---------------------------------------------------------------------------

describe('updateChecklistItemInputSchema', () => {
  it('parses an empty object (all fields optional)', () => {
    expect(() => updateChecklistItemInputSchema.parse({})).not.toThrow();
  });

  it('parses with only title', () => {
    expect(() =>
      updateChecklistItemInputSchema.parse({ title: 'Updated title' }),
    ).not.toThrow();
  });

  it('parses with only isCompleted', () => {
    expect(() =>
      updateChecklistItemInputSchema.parse({ isCompleted: true }),
    ).not.toThrow();
  });

  it('parses with both title and isCompleted', () => {
    expect(() =>
      updateChecklistItemInputSchema.parse({
        title: 'Updated',
        isCompleted: false,
      }),
    ).not.toThrow();
  });

  it('rejects when title is empty string', () => {
    expect(() => updateChecklistItemInputSchema.parse({ title: '' })).toThrow();
  });

  it('rejects when title exceeds 500 characters', () => {
    expect(() =>
      updateChecklistItemInputSchema.parse({ title: 'a'.repeat(501) }),
    ).toThrow();
  });
});

// ---------------------------------------------------------------------------
// reorderChecklistItemSchema
// ---------------------------------------------------------------------------

describe('reorderChecklistItemSchema', () => {
  it('parses a valid reorder item', () => {
    expect(() =>
      reorderChecklistItemSchema.parse({
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        position: 3,
      }),
    ).not.toThrow();
  });

  it('rejects when id is not a uuid', () => {
    expect(() =>
      reorderChecklistItemSchema.parse({ id: 'not-a-uuid', position: 0 }),
    ).toThrow();
  });

  it('rejects when position is missing', () => {
    expect(() =>
      reorderChecklistItemSchema.parse({
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      }),
    ).toThrow();
  });
});
