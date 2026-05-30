import {
  render,
  screen,
  act,
  fireEvent,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { FeedbackSection } from '../FeedbackSection';

const defaultProps = {
  onSubmit: vi.fn(),
  isPending: false,
  isSuccess: false,
};

function renderFeedback(props = {}) {
  return render(<FeedbackSection {...defaultProps} {...props} />, {
    wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
  });
}

async function expandForm(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Send feedback' }));
  await waitFor(() => {
    expect(screen.getByLabelText('Your feedback')).toBeInTheDocument();
  });
}

/** Expand form in fake-timer context using fireEvent + timer flush */
function expandFormSync() {
  fireEvent.click(screen.getByRole('button', { name: 'Send feedback' }));
  act(() => vi.advanceTimersByTime(0)); // flush rAF polyfill
}

beforeEach(() => {
  sessionStorage.clear();
  defaultProps.onSubmit.mockReset();
});

describe('FeedbackSection', () => {
  describe('disclosure', () => {
    it('renders collapsed by default — form fields not in DOM', () => {
      renderFeedback();

      expect(screen.getByText('Help shape TaskOps')).toBeInTheDocument();
      expect(
        screen.getByText(/Found a bug, missing feature/),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Send feedback' }),
      ).toBeInTheDocument();
      expect(screen.queryByLabelText('Your feedback')).not.toBeInTheDocument();
    });

    it('toggle has aria-expanded="false" by default', () => {
      renderFeedback();

      expect(
        screen.getByRole('button', { name: 'Send feedback' }),
      ).toHaveAttribute('aria-expanded', 'false');
    });

    it('clicking toggle expands form and sets aria-expanded="true"', async () => {
      const user = userEvent.setup();
      renderFeedback();

      await expandForm(user);

      const toggle = screen.getByRole('button', { name: 'Hide form' });
      expect(toggle).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByLabelText('Your feedback')).toBeInTheDocument();
    });

    it('toggle has aria-controls pointing to form panel', () => {
      renderFeedback();

      expect(
        screen.getByRole('button', { name: 'Send feedback' }),
      ).toHaveAttribute('aria-controls', 'feedback-form-panel');
    });

    it('toggle label changes to "Hide form" when expanded', async () => {
      const user = userEvent.setup();
      renderFeedback();

      await expandForm(user);

      expect(
        screen.getByRole('button', { name: 'Hide form' }),
      ).toBeInTheDocument();
    });
  });

  it('renders heading, description, and all form fields when expanded', async () => {
    const user = userEvent.setup();
    renderFeedback();

    await expandForm(user);

    expect(screen.getByText('Help shape TaskOps')).toBeInTheDocument();
    expect(
      screen.getByText(/Found a bug, missing feature/),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Your feedback')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByLabelText('Email (optional)')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Send feedback' }),
    ).toBeInTheDocument();
  });

  it('shows validation error on empty message submit', async () => {
    const user = userEvent.setup();
    renderFeedback();

    await expandForm(user);
    await user.click(screen.getByRole('button', { name: 'Send feedback' }));

    expect(screen.getByText('Message is required')).toBeInTheDocument();
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  it('shows validation error on spaces-only message submit', async () => {
    const user = userEvent.setup();
    renderFeedback();

    await expandForm(user);
    await user.type(screen.getByLabelText('Your feedback'), '   ');
    await user.click(screen.getByRole('button', { name: 'Send feedback' }));

    expect(screen.getByText('Message is required')).toBeInTheDocument();
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  it('shows email validation error on invalid email', async () => {
    const user = userEvent.setup();
    renderFeedback();

    await expandForm(user);
    await user.type(
      screen.getByLabelText('Your feedback'),
      'This is my feedback',
    );
    await user.type(screen.getByLabelText('Email (optional)'), 'not-an-email');
    await user.click(screen.getByRole('button', { name: 'Send feedback' }));

    expect(screen.getByText('Please enter a valid email')).toBeInTheDocument();
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  it('does NOT show error when email is empty (optional)', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderFeedback({ onSubmit });

    await expandForm(user);
    await user.type(
      screen.getByLabelText('Your feedback'),
      'This is my feedback',
    );
    await user.click(screen.getByRole('button', { name: 'Send feedback' }));

    expect(
      screen.queryByText('Please enter a valid email'),
    ).not.toBeInTheDocument();
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('calls onSubmit with correct form data when valid', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderFeedback({ onSubmit });

    await expandForm(user);
    await user.type(screen.getByLabelText('Your feedback'), 'Great tool!');
    await user.click(screen.getByRole('button', { name: 'Feature request' }));
    await user.type(
      screen.getByLabelText('Email (optional)'),
      'user@example.com',
    );
    await user.click(screen.getByRole('button', { name: 'Send feedback' }));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit).toHaveBeenCalledWith({
      message: 'Great tool!',
      category: 'feature_request',
      email: 'user@example.com',
    });
  });

  it('character counter updates with input', async () => {
    const user = userEvent.setup();
    renderFeedback();

    await expandForm(user);
    expect(screen.getByText('0/1000')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Your feedback'), 'Hello');
    expect(screen.getByText('5/1000')).toBeInTheDocument();
  });

  it('submit button shows loading state when isPending', async () => {
    const user = userEvent.setup();
    renderFeedback({ isPending: true });

    await expandForm(user);

    const btn = screen.getByRole('button', { name: 'Sending...' });
    expect(btn).toBeInTheDocument();
    expect(btn).toBeDisabled();
  });

  describe('honeypot', () => {
    it('does NOT call onSubmit when honeypot field is filled', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      renderFeedback({ onSubmit });

      await expandForm(user);

      // Fill visible fields
      await user.type(screen.getByLabelText('Your feedback'), 'Legit message');

      // Fill the honeypot input (bots do this — real users can't see/reach it)
      const honeypotInput = document.querySelector(
        'input[name="website"]',
      ) as HTMLInputElement;
      expect(honeypotInput).not.toBeNull();
      await user.type(honeypotInput, 'spam');

      await user.click(screen.getByRole('button', { name: 'Send feedback' }));

      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('cooldown', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
      sessionStorage.clear();
    });

    it('disables submit button during cooldown period', () => {
      sessionStorage.setItem(
        'feedback_cooldown_until',
        String(Date.now() + 30_000),
      );

      renderFeedback({ isSuccess: false });

      expandFormSync();

      const btn = screen.getByRole('button', {
        name: /You can send again in/i,
      });
      expect(btn).toBeDisabled();
    });

    it('shows countdown text during cooldown', () => {
      sessionStorage.setItem(
        'feedback_cooldown_until',
        String(Date.now() + 15_000),
      );

      renderFeedback({ isSuccess: false });

      expandFormSync();

      expect(
        screen.getByText(/You can send again in \d+s/),
      ).toBeInTheDocument();
    });

    it('recovers cooldown state from sessionStorage after remount', () => {
      const until = Date.now() + 20_000;
      sessionStorage.setItem('feedback_cooldown_until', String(until));

      const { unmount } = renderFeedback({ isSuccess: false });

      expandFormSync();
      expect(
        screen.getByText(/You can send again in \d+s/),
      ).toBeInTheDocument();

      unmount();

      renderFeedback({ isSuccess: false });

      expandFormSync();
      expect(
        screen.getByText(/You can send again in \d+s/),
      ).toBeInTheDocument();
    });
  });

  describe('auto-collapse on success', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
      sessionStorage.clear();
    });

    it('collapses form after 2000ms + animation on success', () => {
      const Wrapper = ({ children }: { children: React.ReactNode }) => (
        <MemoryRouter>{children}</MemoryRouter>
      );

      const { rerender } = render(<FeedbackSection {...defaultProps} />, {
        wrapper: Wrapper,
      });

      expandFormSync();
      expect(screen.getByLabelText('Your feedback')).toBeInTheDocument();

      // Simulate success
      rerender(<FeedbackSection {...defaultProps} isSuccess={true} />);

      // Form still visible before timeout
      expect(screen.getByRole('button', { name: 'Hide form' })).toHaveAttribute(
        'aria-expanded',
        'true',
      );

      // Advance past 2000ms success delay + 300ms animation
      act(() => vi.advanceTimersByTime(2300));

      // Form collapsed — fields removed from DOM
      expect(screen.queryByLabelText('Your feedback')).not.toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Send feedback' }),
      ).toHaveAttribute('aria-expanded', 'false');
    });
  });
});
