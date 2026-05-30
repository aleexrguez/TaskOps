import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useScrollLock, _resetForTesting } from '../use-scroll-lock';

describe('useScrollLock', () => {
  beforeEach(() => {
    _resetForTesting();
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.paddingRight = '';
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    Object.defineProperty(window, 'scrollY', {
      value: 0,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window, 'innerWidth', {
      value: 1024,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, 'clientWidth', {
      value: 1024,
      writable: true,
      configurable: true,
    });
  });

  it('sets body styles when locked', () => {
    Object.defineProperty(window, 'scrollY', { value: 150 });

    renderHook(() => useScrollLock(true));

    expect(document.body.style.overflow).toBe('hidden');
    expect(document.body.style.position).toBe('fixed');
    expect(document.body.style.top).toBe('-150px');
    expect(document.body.style.width).toBe('100%');
  });

  it('restores all original styles on unmount', () => {
    document.body.style.overflow = 'auto';
    document.body.style.position = 'relative';
    document.body.style.top = '10px';
    document.body.style.width = '90%';

    const { unmount } = renderHook(() => useScrollLock(true));

    expect(document.body.style.overflow).toBe('hidden');
    expect(document.body.style.position).toBe('fixed');

    unmount();

    expect(document.body.style.overflow).toBe('auto');
    expect(document.body.style.position).toBe('relative');
    expect(document.body.style.top).toBe('10px');
    expect(document.body.style.width).toBe('90%');
  });

  it('does not modify body when not locked', () => {
    renderHook(() => useScrollLock(false));

    expect(document.body.style.overflow).toBe('');
    expect(document.body.style.position).toBe('');
    expect(document.body.style.top).toBe('');
    expect(document.body.style.width).toBe('');
  });

  it('compensates scrollbar width with paddingRight', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024 });
    Object.defineProperty(document.documentElement, 'clientWidth', {
      value: 1009,
    });

    renderHook(() => useScrollLock(true));

    expect(document.body.style.paddingRight).toBe('15px');
  });

  it('does not set paddingRight when no scrollbar', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024 });
    Object.defineProperty(document.documentElement, 'clientWidth', {
      value: 1024,
    });

    renderHook(() => useScrollLock(true));

    expect(document.body.style.paddingRight).toBe('');
  });

  it('does not restore styles when only one of two locks unmounts', () => {
    const hook1 = renderHook(() => useScrollLock(true));
    const hook2 = renderHook(() => useScrollLock(true));

    hook2.unmount();

    expect(document.body.style.overflow).toBe('hidden');
    expect(document.body.style.position).toBe('fixed');
    expect(document.body.style.width).toBe('100%');

    hook1.unmount();

    expect(document.body.style.overflow).toBe('');
    expect(document.body.style.position).toBe('');
  });

  it('restores styles only when the last lock unmounts', () => {
    document.body.style.overflow = 'scroll';

    const hook1 = renderHook(() => useScrollLock(true));
    const hook2 = renderHook(() => useScrollLock(true));
    const hook3 = renderHook(() => useScrollLock(true));

    hook3.unmount();
    expect(document.body.style.overflow).toBe('hidden');

    hook2.unmount();
    expect(document.body.style.overflow).toBe('hidden');

    hook1.unmount();
    expect(document.body.style.overflow).toBe('scroll');
  });

  it('restores scrollY with window.scrollTo when releasing last lock', () => {
    Object.defineProperty(window, 'scrollY', { value: 300 });

    const { unmount } = renderHook(() => useScrollLock(true));

    vi.mocked(window.scrollTo).mockClear();

    unmount();

    expect(window.scrollTo).toHaveBeenCalledTimes(1);
    expect(window.scrollTo).toHaveBeenCalledWith(0, 300);
  });

  it('does not double-apply styles on re-renders', () => {
    const { rerender } = renderHook(({ locked }) => useScrollLock(locked), {
      initialProps: { locked: true },
    });

    expect(document.body.style.overflow).toBe('hidden');

    rerender({ locked: true });

    expect(document.body.style.overflow).toBe('hidden');
    expect(document.body.style.position).toBe('fixed');
  });
});
