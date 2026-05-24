import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AuthDivider } from '../AuthDivider';

describe('AuthDivider', () => {
  it('renders divider text', () => {
    render(<AuthDivider text="or continue with email" />);

    expect(screen.getByText('or continue with email')).toBeInTheDocument();
  });
});
