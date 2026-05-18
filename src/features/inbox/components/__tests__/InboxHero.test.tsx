import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { InboxHero } from '../InboxHero';

describe('InboxHero', () => {
  it('renders greeting and display name', () => {
    render(<InboxHero greeting="Good morning" displayName="Alex" />);

    expect(screen.getByText('Good morning, Alex')).toBeInTheDocument();
  });

  it('renders the subtitle text', () => {
    render(<InboxHero greeting="Good evening" displayName="there" />);

    expect(
      screen.getByText('What do you want to capture today?'),
    ).toBeInTheDocument();
  });

  it('renders with email-derived display name', () => {
    render(<InboxHero greeting="Good afternoon" displayName="alexdiablo4m" />);

    expect(
      screen.getByText('Good afternoon, alexdiablo4m'),
    ).toBeInTheDocument();
  });

  it('renders with fallback display name', () => {
    render(<InboxHero greeting="Good morning" displayName="there" />);

    expect(screen.getByText('Good morning, there')).toBeInTheDocument();
  });
});
