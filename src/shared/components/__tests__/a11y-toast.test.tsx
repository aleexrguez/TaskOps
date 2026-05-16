import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { Toast } from '../Toast';

describe('Toast accessibility', () => {
  it('dismiss button has contextual aria-label including the message', () => {
    render(
      <Toast
        id="toast-1"
        message="Task created"
        type="success"
        onDismiss={vi.fn()}
      />,
    );

    expect(
      screen.getByRole('button', { name: /dismiss.*task created/i }),
    ).toBeInTheDocument();
  });
});
