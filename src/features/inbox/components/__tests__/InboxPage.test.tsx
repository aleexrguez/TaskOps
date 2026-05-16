import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { InboxPage } from '../InboxPage';
import { InboxEmptyState } from '../InboxEmptyState';

describe('InboxPage', () => {
  it('renders header with title', () => {
    render(
      <InboxPage itemCount={0} quickInput={<div>input</div>}>
        <InboxEmptyState />
      </InboxPage>,
    );

    expect(screen.getByText('Inbox')).toBeInTheDocument();
  });

  it('renders empty state when no items', () => {
    render(
      <InboxPage itemCount={0} quickInput={<div>input</div>}>
        <InboxEmptyState />
      </InboxPage>,
    );

    expect(screen.getByText('Your inbox is empty')).toBeInTheDocument();
  });

  it('does not show count badge when itemCount is 0', () => {
    render(
      <InboxPage itemCount={0} quickInput={<div>input</div>}>
        <div>content</div>
      </InboxPage>,
    );

    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('shows count badge when items exist', () => {
    render(
      <InboxPage itemCount={3} quickInput={<div>input</div>}>
        <div>item list</div>
      </InboxPage>,
    );

    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders quick input slot', () => {
    render(
      <InboxPage
        itemCount={0}
        quickInput={<div data-testid="quick-input">quick input</div>}
      >
        <div>content</div>
      </InboxPage>,
    );

    expect(screen.getByTestId('quick-input')).toBeInTheDocument();
  });

  it('renders children (item list)', () => {
    render(
      <InboxPage itemCount={2} quickInput={<div>input</div>}>
        <div data-testid="item-list">items here</div>
      </InboxPage>,
    );

    expect(screen.getByTestId('item-list')).toBeInTheDocument();
  });
});
