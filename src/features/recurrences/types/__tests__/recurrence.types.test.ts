import { describe, it, expect } from 'vitest';
import {
  recurrenceFrequencySchema,
  recurrenceTemplateSchema,
  createRecurrenceInputSchema,
  updateRecurrenceInputSchema,
} from '../recurrence.types';

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

const BASE_TEMPLATE = {
  id: 'a0000000-0000-4000-8000-000000000001', // valid v4 UUID
  title: 'Daily standup',
  priority: 'medium' as const,
  frequency: 'daily' as const,
  isActive: true,
  createdAt: '2024-01-10T10:00:00.000Z',
  updatedAt: '2024-01-10T10:00:00.000Z',
};

// ---------------------------------------------------------------------------
// 1. recurrenceFrequencySchema
// ---------------------------------------------------------------------------

describe('recurrenceFrequencySchema', () => {
  it('accepts valid frequency values', () => {
    expect(recurrenceFrequencySchema.parse('daily')).toBe('daily');
    expect(recurrenceFrequencySchema.parse('weekly')).toBe('weekly');
    expect(recurrenceFrequencySchema.parse('monthly')).toBe('monthly');
  });

  it('rejects invalid frequency values', () => {
    expect(() => recurrenceFrequencySchema.parse('hourly')).toThrow();
    expect(() => recurrenceFrequencySchema.parse('')).toThrow();
    expect(() => recurrenceFrequencySchema.parse(null)).toThrow();
  });
});

// ---------------------------------------------------------------------------
// 2. recurrenceTemplateSchema
// ---------------------------------------------------------------------------

describe('recurrenceTemplateSchema', () => {
  it('parses a valid daily template', () => {
    const result = recurrenceTemplateSchema.parse(BASE_TEMPLATE);
    expect(result.id).toBe(BASE_TEMPLATE.id);
    expect(result.frequency).toBe('daily');
    expect(result.isActive).toBe(true);
  });

  it('parses a valid weekly template with weeklyDays', () => {
    const result = recurrenceTemplateSchema.parse({
      ...BASE_TEMPLATE,
      frequency: 'weekly',
      weeklyDays: [1, 3, 5],
    });
    expect(result.weeklyDays).toEqual([1, 3, 5]);
  });

  it('parses a valid monthly template with monthlyDay', () => {
    const result = recurrenceTemplateSchema.parse({
      ...BASE_TEMPLATE,
      frequency: 'monthly',
      monthlyDay: 15,
    });
    expect(result.monthlyDay).toBe(15);
  });

  it('accepts optional description', () => {
    const result = recurrenceTemplateSchema.parse({
      ...BASE_TEMPLATE,
      description: 'A recurring standup',
    });
    expect(result.description).toBe('A recurring standup');
  });

  it('rejects a title that is empty', () => {
    expect(() =>
      recurrenceTemplateSchema.parse({ ...BASE_TEMPLATE, title: '' }),
    ).toThrow();
  });

  it('rejects a title longer than 200 characters', () => {
    expect(() =>
      recurrenceTemplateSchema.parse({
        ...BASE_TEMPLATE,
        title: 'x'.repeat(201),
      }),
    ).toThrow();
  });

  it('rejects a description longer than 2000 characters', () => {
    expect(() =>
      recurrenceTemplateSchema.parse({
        ...BASE_TEMPLATE,
        description: 'x'.repeat(2001),
      }),
    ).toThrow();
  });

  it('rejects an invalid UUID for id', () => {
    expect(() =>
      recurrenceTemplateSchema.parse({ ...BASE_TEMPLATE, id: 'not-a-uuid' }),
    ).toThrow();
  });

  it('rejects an invalid priority', () => {
    expect(() =>
      recurrenceTemplateSchema.parse({ ...BASE_TEMPLATE, priority: 'urgent' }),
    ).toThrow();
  });

  it('rejects weeklyDays with values outside 1-7', () => {
    expect(() =>
      recurrenceTemplateSchema.parse({
        ...BASE_TEMPLATE,
        frequency: 'weekly',
        weeklyDays: [0, 1],
      }),
    ).toThrow();

    expect(() =>
      recurrenceTemplateSchema.parse({
        ...BASE_TEMPLATE,
        frequency: 'weekly',
        weeklyDays: [1, 8],
      }),
    ).toThrow();
  });

  it('defaults leadTimeDays to 0 when not provided', () => {
    const result = recurrenceTemplateSchema.parse(BASE_TEMPLATE);
    expect(result.leadTimeDays).toBe(0);
  });

  it('accepts leadTimeDays of 14 (at cap)', () => {
    const result = recurrenceTemplateSchema.parse({
      ...BASE_TEMPLATE,
      leadTimeDays: 14,
    });
    expect(result.leadTimeDays).toBe(14);
  });

  it('rejects leadTimeDays of 15 (exceeds cap)', () => {
    expect(() =>
      recurrenceTemplateSchema.parse({ ...BASE_TEMPLATE, leadTimeDays: 15 }),
    ).toThrow();
  });

  it('rejects leadTimeDays of -1', () => {
    expect(() =>
      recurrenceTemplateSchema.parse({ ...BASE_TEMPLATE, leadTimeDays: -1 }),
    ).toThrow();
  });

  it('rejects monthlyDay outside 1-31', () => {
    expect(() =>
      recurrenceTemplateSchema.parse({
        ...BASE_TEMPLATE,
        frequency: 'monthly',
        monthlyDay: 0,
      }),
    ).toThrow();

    expect(() =>
      recurrenceTemplateSchema.parse({
        ...BASE_TEMPLATE,
        frequency: 'monthly',
        monthlyDay: 32,
      }),
    ).toThrow();
  });
});

// ---------------------------------------------------------------------------
// 3. createRecurrenceInputSchema (discriminated union)
// ---------------------------------------------------------------------------

describe('createRecurrenceInputSchema', () => {
  describe('daily frequency', () => {
    it('accepts a valid daily input', () => {
      const result = createRecurrenceInputSchema.parse({
        frequency: 'daily',
        title: 'Morning routine',
      });
      expect(result.frequency).toBe('daily');
      expect(result.title).toBe('Morning routine');
    });

    it('defaults priority to medium when not specified', () => {
      const result = createRecurrenceInputSchema.parse({
        frequency: 'daily',
        title: 'Morning routine',
      });
      expect(result.priority).toBe('medium');
    });

    it('accepts optional description', () => {
      const result = createRecurrenceInputSchema.parse({
        frequency: 'daily',
        title: 'Morning routine',
        description: 'A daily morning routine',
      });
      expect(result.description).toBe('A daily morning routine');
    });

    it('accepts explicit priority', () => {
      const result = createRecurrenceInputSchema.parse({
        frequency: 'daily',
        title: 'Morning routine',
        priority: 'high',
      });
      expect(result.priority).toBe('high');
    });

    it('rejects an empty title', () => {
      expect(() =>
        createRecurrenceInputSchema.parse({ frequency: 'daily', title: '' }),
      ).toThrow();
    });

    it('rejects a title longer than 200 characters', () => {
      expect(() =>
        createRecurrenceInputSchema.parse({
          frequency: 'daily',
          title: 'x'.repeat(201),
        }),
      ).toThrow();
    });
  });

  describe('weekly frequency', () => {
    it('accepts a valid weekly input with weeklyDays', () => {
      const result = createRecurrenceInputSchema.parse({
        frequency: 'weekly',
        title: 'Team sync',
        weeklyDays: [1, 3, 5],
      });
      expect(result.frequency).toBe('weekly');
      expect((result as { weeklyDays: number[] }).weeklyDays).toEqual([
        1, 3, 5,
      ]);
    });

    it('defaults priority to medium', () => {
      const result = createRecurrenceInputSchema.parse({
        frequency: 'weekly',
        title: 'Team sync',
        weeklyDays: [2],
      });
      expect(result.priority).toBe('medium');
    });

    it('rejects weekly input without weeklyDays', () => {
      expect(() =>
        createRecurrenceInputSchema.parse({
          frequency: 'weekly',
          title: 'Team sync',
        }),
      ).toThrow();
    });

    it('rejects weekly input with empty weeklyDays array', () => {
      expect(() =>
        createRecurrenceInputSchema.parse({
          frequency: 'weekly',
          title: 'Team sync',
          weeklyDays: [],
        }),
      ).toThrow();
    });

    it('rejects duplicate days in weeklyDays', () => {
      expect(() =>
        createRecurrenceInputSchema.parse({
          frequency: 'weekly',
          title: 'Team sync',
          weeklyDays: [1, 1, 3],
        }),
      ).toThrow();
    });

    it('rejects weeklyDays values outside 1-7', () => {
      expect(() =>
        createRecurrenceInputSchema.parse({
          frequency: 'weekly',
          title: 'Team sync',
          weeklyDays: [0],
        }),
      ).toThrow();

      expect(() =>
        createRecurrenceInputSchema.parse({
          frequency: 'weekly',
          title: 'Team sync',
          weeklyDays: [8],
        }),
      ).toThrow();
    });

    it('accepts all 7 days (1-7)', () => {
      const result = createRecurrenceInputSchema.parse({
        frequency: 'weekly',
        title: 'Every day',
        weeklyDays: [1, 2, 3, 4, 5, 6, 7],
      });
      expect((result as { weeklyDays: number[] }).weeklyDays).toHaveLength(7);
    });

    it('accepts Sunday as day 7', () => {
      const result = createRecurrenceInputSchema.parse({
        frequency: 'weekly',
        title: 'Sunday review',
        weeklyDays: [7],
      });
      expect((result as { weeklyDays: number[] }).weeklyDays).toEqual([7]);
    });
  });

  describe('monthly frequency', () => {
    it('accepts a valid monthly input', () => {
      const result = createRecurrenceInputSchema.parse({
        frequency: 'monthly',
        title: 'Monthly report',
        monthlyDay: 15,
      });
      expect(result.frequency).toBe('monthly');
      expect((result as { monthlyDay: number }).monthlyDay).toBe(15);
    });

    it('defaults priority to medium', () => {
      const result = createRecurrenceInputSchema.parse({
        frequency: 'monthly',
        title: 'Monthly report',
        monthlyDay: 1,
      });
      expect(result.priority).toBe('medium');
    });

    it('rejects monthly input without monthlyDay', () => {
      expect(() =>
        createRecurrenceInputSchema.parse({
          frequency: 'monthly',
          title: 'Monthly report',
        }),
      ).toThrow();
    });

    it('rejects monthlyDay of 0', () => {
      expect(() =>
        createRecurrenceInputSchema.parse({
          frequency: 'monthly',
          title: 'Monthly report',
          monthlyDay: 0,
        }),
      ).toThrow();
    });

    it('rejects monthlyDay of 32', () => {
      expect(() =>
        createRecurrenceInputSchema.parse({
          frequency: 'monthly',
          title: 'Monthly report',
          monthlyDay: 32,
        }),
      ).toThrow();
    });

    it('accepts monthlyDay of 31 (last possible day)', () => {
      const result = createRecurrenceInputSchema.parse({
        frequency: 'monthly',
        title: 'End of month',
        monthlyDay: 31,
      });
      expect((result as { monthlyDay: number }).monthlyDay).toBe(31);
    });

    it('accepts monthlyDay of 1 (first day)', () => {
      const result = createRecurrenceInputSchema.parse({
        frequency: 'monthly',
        title: 'First of month',
        monthlyDay: 1,
      });
      expect((result as { monthlyDay: number }).monthlyDay).toBe(1);
    });
  });

  describe('invalid frequency', () => {
    it('rejects an unknown frequency value', () => {
      expect(() =>
        createRecurrenceInputSchema.parse({
          frequency: 'hourly',
          title: 'Invalid',
        }),
      ).toThrow();
    });

    it('rejects input with no frequency', () => {
      expect(() =>
        createRecurrenceInputSchema.parse({ title: 'No frequency' }),
      ).toThrow();
    });
  });
});

// ---------------------------------------------------------------------------
// 3b. createRecurrenceInputSchema — leadTimeDays
// ---------------------------------------------------------------------------

describe('createRecurrenceInputSchema — leadTimeDays', () => {
  it('accepts monthly input with leadTimeDays = 5', () => {
    const result = createRecurrenceInputSchema.parse({
      frequency: 'monthly',
      title: 'Monthly report',
      monthlyDay: 15,
      leadTimeDays: 5,
    });
    expect((result as { leadTimeDays: number }).leadTimeDays).toBe(5);
  });

  it('rejects monthly input with leadTimeDays = 15 (exceeds cap of 14)', () => {
    expect(() =>
      createRecurrenceInputSchema.parse({
        frequency: 'monthly',
        title: 'Monthly report',
        monthlyDay: 15,
        leadTimeDays: 15,
      }),
    ).toThrow();
  });

  it('rejects monthly input with leadTimeDays = -1', () => {
    expect(() =>
      createRecurrenceInputSchema.parse({
        frequency: 'monthly',
        title: 'Monthly report',
        monthlyDay: 15,
        leadTimeDays: -1,
      }),
    ).toThrow();
  });

  it('defaults leadTimeDays to 0 when not provided for monthly', () => {
    const result = createRecurrenceInputSchema.parse({
      frequency: 'monthly',
      title: 'Monthly report',
      monthlyDay: 15,
    });
    expect((result as { leadTimeDays: number }).leadTimeDays).toBe(0);
  });

  it('daily input does not accept leadTimeDays (field is absent from the type)', () => {
    // Daily never has leadTimeDays — the field should not exist in the output
    const result = createRecurrenceInputSchema.parse({
      frequency: 'daily',
      title: 'Morning routine',
    });
    expect('leadTimeDays' in result).toBe(false);
  });

  it('weekly input does not accept leadTimeDays (field is absent from the type)', () => {
    // Weekly never has leadTimeDays — the field should not exist in the output
    const result = createRecurrenceInputSchema.parse({
      frequency: 'weekly',
      title: 'Team sync',
      weeklyDays: [1, 3],
    });
    expect('leadTimeDays' in result).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 4. updateRecurrenceInputSchema
// ---------------------------------------------------------------------------

describe('updateRecurrenceInputSchema', () => {
  it('accepts an empty object (all fields optional)', () => {
    const result = updateRecurrenceInputSchema.parse({});
    expect(result).toEqual({});
  });

  it('accepts a partial update with only title', () => {
    const result = updateRecurrenceInputSchema.parse({ title: 'New title' });
    expect(result.title).toBe('New title');
  });

  it('accepts a partial update with only isActive', () => {
    const result = updateRecurrenceInputSchema.parse({ isActive: false });
    expect(result.isActive).toBe(false);
  });

  it('accepts a full update with all fields', () => {
    const result = updateRecurrenceInputSchema.parse({
      title: 'Updated title',
      description: 'Updated description',
      priority: 'high',
      isActive: false,
    });
    expect(result.title).toBe('Updated title');
    expect(result.priority).toBe('high');
    expect(result.isActive).toBe(false);
  });

  it('rejects a title that is empty', () => {
    expect(() => updateRecurrenceInputSchema.parse({ title: '' })).toThrow();
  });

  it('rejects an invalid priority', () => {
    expect(() =>
      updateRecurrenceInputSchema.parse({ priority: 'critical' }),
    ).toThrow();
  });

  it('accepts a partial update with only leadTimeDays', () => {
    const result = updateRecurrenceInputSchema.parse({ leadTimeDays: 7 });
    expect(result.leadTimeDays).toBe(7);
  });

  it('rejects leadTimeDays of 15 in update (exceeds cap)', () => {
    expect(() =>
      updateRecurrenceInputSchema.parse({ leadTimeDays: 15 }),
    ).toThrow();
  });

  it('rejects leadTimeDays of -1 in update', () => {
    expect(() =>
      updateRecurrenceInputSchema.parse({ leadTimeDays: -1 }),
    ).toThrow();
  });
});
