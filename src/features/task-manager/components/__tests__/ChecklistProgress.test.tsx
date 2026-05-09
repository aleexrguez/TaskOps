import { render, screen } from '@testing-library/react';
import { ChecklistProgress } from '../ChecklistProgress';

describe('ChecklistProgress', () => {
  it('returns null when total is 0', () => {
    const { container } = render(<ChecklistProgress completed={0} total={0} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders "0/3" when 0 completed out of 3', () => {
    render(<ChecklistProgress completed={0} total={3} />);
    expect(screen.getByText('0/3')).toBeInTheDocument();
  });

  it('renders "2/5" text correctly', () => {
    render(<ChecklistProgress completed={2} total={5} />);
    expect(screen.getByText('2/5')).toBeInTheDocument();
  });

  it('shows green bar when all items are complete', () => {
    render(<ChecklistProgress completed={5} total={5} />);
    const progressbar = screen.getByRole('progressbar');
    const innerBar = progressbar.firstChild as HTMLElement;
    expect(innerBar.className).toContain('bg-green-500');
  });

  it('shows indigo bar when not all items are complete', () => {
    render(<ChecklistProgress completed={2} total={5} />);
    const progressbar = screen.getByRole('progressbar');
    const innerBar = progressbar.firstChild as HTMLElement;
    expect(innerBar.className).toContain('bg-indigo-500');
  });

  it('sets progress bar width to match percentage', () => {
    render(<ChecklistProgress completed={2} total={5} />);
    const progressbar = screen.getByRole('progressbar');
    const innerBar = progressbar.firstChild as HTMLElement;
    expect(innerBar.style.width).toBe('40%');
  });

  it('has correct ARIA attributes on progressbar', () => {
    render(<ChecklistProgress completed={3} total={7} />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '3');
    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '7');
  });
});
