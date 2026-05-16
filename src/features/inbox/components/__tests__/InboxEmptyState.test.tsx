import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { InboxEmptyState } from '../InboxEmptyState';

describe('InboxEmptyState', () => {
  it('renders empty state message', () => {
    render(<InboxEmptyState />);
    expect(screen.getByText('Your inbox is empty')).toBeInTheDocument();
    expect(screen.getByText(/Capture quick ideas above/)).toBeInTheDocument();
  });
});
