import { describe, it, expect } from 'vitest';
import { getGreeting, getDisplayName } from '../greeting.utils';

describe('getGreeting', () => {
  it('returns "Good morning" for hour 5', () => {
    expect(getGreeting(5)).toBe('Good morning');
  });

  it('returns "Good morning" for hour 11', () => {
    expect(getGreeting(11)).toBe('Good morning');
  });

  it('returns "Good morning" for mid-morning hour 9', () => {
    expect(getGreeting(9)).toBe('Good morning');
  });

  it('returns "Good afternoon" for hour 12', () => {
    expect(getGreeting(12)).toBe('Good afternoon');
  });

  it('returns "Good afternoon" for hour 17', () => {
    expect(getGreeting(17)).toBe('Good afternoon');
  });

  it('returns "Good afternoon" for mid-afternoon hour 14', () => {
    expect(getGreeting(14)).toBe('Good afternoon');
  });

  it('returns "Good evening" for hour 18', () => {
    expect(getGreeting(18)).toBe('Good evening');
  });

  it('returns "Good evening" for hour 23', () => {
    expect(getGreeting(23)).toBe('Good evening');
  });

  it('returns "Good evening" for hour 0 (midnight)', () => {
    expect(getGreeting(0)).toBe('Good evening');
  });

  it('returns "Good evening" for hour 4 (late night)', () => {
    expect(getGreeting(4)).toBe('Good evening');
  });
});

describe('getDisplayName', () => {
  it('returns first word of display_name when present', () => {
    expect(
      getDisplayName({ display_name: 'Alessandro' }, 'a@example.com'),
    ).toBe('Alessandro');
  });

  it('returns only first word when display_name has multiple words', () => {
    expect(
      getDisplayName({ display_name: 'Alessandro Rodriguez' }, 'a@example.com'),
    ).toBe('Alessandro');
  });

  it('trims whitespace from display_name', () => {
    expect(getDisplayName({ display_name: '  Alex  ' }, 'a@example.com')).toBe(
      'Alex',
    );
  });

  it('extracts username from email when display_name is null', () => {
    expect(getDisplayName({ display_name: null }, 'alex@gmail.com')).toBe(
      'alex',
    );
  });

  it('extracts username from email when profile is null', () => {
    expect(getDisplayName(null, 'alex@gmail.com')).toBe('alex');
  });

  it('extracts username from email when profile is undefined', () => {
    expect(getDisplayName(undefined, 'alex@gmail.com')).toBe('alex');
  });

  it('returns "there" when both profile and email are absent', () => {
    expect(getDisplayName(null, undefined)).toBe('there');
  });

  it('returns "there" when profile is null and email is undefined', () => {
    expect(getDisplayName(undefined, undefined)).toBe('there');
  });

  it('skips whitespace-only display_name and falls back to email', () => {
    expect(getDisplayName({ display_name: '   ' }, 'alex@gmail.com')).toBe(
      'alex',
    );
  });

  it('skips empty display_name and falls back to email', () => {
    expect(getDisplayName({ display_name: '' }, 'alex@gmail.com')).toBe('alex');
  });

  it('returns "there" when display_name is empty and email is undefined', () => {
    expect(getDisplayName({ display_name: '' }, undefined)).toBe('there');
  });
});
