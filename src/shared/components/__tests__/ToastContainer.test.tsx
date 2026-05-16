import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { useToastStore } from '../../store/toast.store';
import { ToastContainer } from '../ToastContainer';

describe('ToastContainer', () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
  });

  it('renders nothing when there are no toasts', () => {
    render(<ToastContainer />);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders all toasts from the store', () => {
    const { addToast } = useToastStore.getState();

    addToast('First toast', 'success');
    addToast('Second toast', 'error');
    addToast('Third toast', 'info');

    render(<ToastContainer />);

    expect(screen.getByText('First toast')).toBeInTheDocument();
    expect(screen.getByText('Second toast')).toBeInTheDocument();
    expect(screen.getByText('Third toast')).toBeInTheDocument();
  });

  it('removes a toast when its dismiss button is clicked', async () => {
    const { addToast } = useToastStore.getState();
    const user = userEvent.setup();

    addToast('Removable toast', 'info');

    render(<ToastContainer />);

    expect(screen.getByText('Removable toast')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /dismiss|close/i }));

    expect(screen.queryByText('Removable toast')).not.toBeInTheDocument();
  });

  it('auto-dismisses toasts after 4 seconds', async () => {
    vi.useFakeTimers();

    const { addToast } = useToastStore.getState();

    addToast('Auto-dismiss me', 'success');

    render(<ToastContainer />);

    expect(screen.getByText('Auto-dismiss me')).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(4000);
    });

    expect(screen.queryByText('Auto-dismiss me')).not.toBeInTheDocument();

    vi.useRealTimers();
  });
});
