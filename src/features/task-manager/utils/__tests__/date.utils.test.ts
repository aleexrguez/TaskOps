import { describe, expect, it } from 'vitest';
import { formatDate, formatDateTime } from '../date.utils';

describe('formatDate', () => {
  it('formats a full ISO datetime string', () => {
    expect(formatDate('2026-03-15T10:00:00.000Z')).toBe('Mar 15, 2026');
  });

  it('formats a date-only YYYY-MM-DD string as local date', () => {
    // This is the critical test: YYYY-MM-DD must NOT shift to the
    // previous day in timezones behind UTC (e.g. UTC-5).
    expect(formatDate('2026-01-01')).toBe('Jan 1, 2026');
  });

  it('formats another date-only string correctly', () => {
    expect(formatDate('2026-12-25')).toBe('Dec 25, 2026');
  });

  it('handles a datetime with positive UTC offset', () => {
    expect(formatDate('2026-07-04T23:59:59.000Z')).toMatch(/Jul [45], 2026/);
  });

  it('formatDate with es locale returns Spanish month', () => {
    expect(formatDate('2026-05-18', 'es')).toMatch(/may/i);
  });
});

describe('formatDateTime', () => {
  it('formats a full ISO datetime with time', () => {
    const result = formatDateTime('2026-03-15T14:30:00.000Z');
    // Date part is always present
    expect(result).toContain('Mar');
    expect(result).toContain('2026');
    // Separator
    expect(result).toContain('·');
    // Time part (locale-dependent offset, but format is h:mm AM/PM)
    expect(result).toMatch(/\d{1,2}:\d{2}\s[AP]M$/);
  });

  it('formats midnight UTC correctly', () => {
    const result = formatDateTime('2026-01-01T00:00:00.000Z');
    expect(result).toContain('2026');
    expect(result).toMatch(/\d{1,2}:\d{2}\s[AP]M$/);
  });

  it('formatDateTime with es locale returns Spanish month', () => {
    expect(formatDateTime('2026-05-18T15:30:00.000Z', 'es')).toMatch(/may/i);
  });
});
