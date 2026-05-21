import { render, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ScrollToTop } from '../ScrollToTop';

function NavigateButton({ to }: { to: string }) {
  const navigate = useNavigate();
  return (
    <button type="button" onClick={() => navigate(to)}>
      Go
    </button>
  );
}

describe('ScrollToTop', () => {
  beforeEach(() => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls scrollTo(0, 0) on initial render without hash', () => {
    render(
      <MemoryRouter initialEntries={['/privacy']}>
        <ScrollToTop />
        <Routes>
          <Route path="*" element={<div>Page</div>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('calls scrollTo(0, 0) when pathname changes', async () => {
    const user = userEvent.setup();
    const { getByText } = render(
      <MemoryRouter initialEntries={['/privacy']}>
        <ScrollToTop />
        <Routes>
          <Route path="*" element={<NavigateButton to="/terms" />} />
        </Routes>
      </MemoryRouter>,
    );
    vi.mocked(window.scrollTo).mockClear();

    await act(async () => {
      await user.click(getByText('Go'));
    });

    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('does not call scrollTo when location has a hash', () => {
    render(
      <MemoryRouter initialEntries={['/privacy#section']}>
        <ScrollToTop />
        <Routes>
          <Route path="*" element={<div>Page</div>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(window.scrollTo).not.toHaveBeenCalled();
  });
});
