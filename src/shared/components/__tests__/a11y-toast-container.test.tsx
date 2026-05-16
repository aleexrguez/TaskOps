import { render, screen } from '@testing-library/react';
import { useToastStore } from '../../store/toast.store';
import { ToastContainer } from '../ToastContainer';

describe('ToastContainer accessibility', () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
  });

  it('has role="region" and aria-label="Notifications" when toasts exist', () => {
    const { addToast } = useToastStore.getState();
    addToast('Something happened', 'info');

    render(<ToastContainer />);

    const region = screen.getByRole('region');
    expect(region).toBeInTheDocument();
    expect(region).toHaveAttribute('aria-label', 'Notifications');
  });

  it('has aria-live="polite"', () => {
    const { addToast } = useToastStore.getState();
    addToast('Something happened', 'info');

    render(<ToastContainer />);

    const region = screen.getByRole('region');
    expect(region).toHaveAttribute('aria-live', 'polite');
  });
});
