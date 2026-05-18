import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ParticleBackground } from '../ParticleBackground';

describe('ParticleBackground', () => {
  it('renders a container with aria-hidden="true"', () => {
    render(<ParticleBackground />);

    const container = screen.getByTestId('particle-background');
    expect(container).toHaveAttribute('aria-hidden', 'true');
  });

  it('has pointer-events-none class', () => {
    render(<ParticleBackground />);

    const container = screen.getByTestId('particle-background');
    expect(container).toHaveClass('pointer-events-none');
  });

  it('has fixed positioning', () => {
    render(<ParticleBackground />);

    const container = screen.getByTestId('particle-background');
    expect(container).toHaveClass('fixed');
  });

  it('renders particle dot elements', () => {
    render(<ParticleBackground />);

    const container = screen.getByTestId('particle-background');
    const dots = container.querySelectorAll('.particle-bg-dot');
    expect(dots.length).toBeGreaterThanOrEqual(28);
    expect(dots.length).toBeLessThanOrEqual(32);
  });
});
