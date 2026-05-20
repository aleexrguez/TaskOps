import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest';
import { useAppPreferencesStore } from '@/shared/store/app-preferences.store';
import { useLanguageSync } from '../useLanguageSync';
import i18n from '../i18n';

beforeEach(() => {
  // Reset store to English and clear localStorage
  useAppPreferencesStore.setState({ language: 'en' });
  localStorage.clear();
  document.documentElement.lang = '';
});

describe('useLanguageSync', () => {
  it('sets document.documentElement.lang to the current store language on mount', () => {
    useAppPreferencesStore.setState({ language: 'es' });

    renderHook(() => useLanguageSync());

    expect(document.documentElement.lang).toBe('es');
  });

  it('updates document.documentElement.lang when store language changes', () => {
    renderHook(() => useLanguageSync());

    act(() => {
      useAppPreferencesStore.getState().setLanguage('es');
    });

    expect(document.documentElement.lang).toBe('es');
  });

  it('changes i18n language when store language changes', () => {
    renderHook(() => useLanguageSync());

    act(() => {
      useAppPreferencesStore.getState().setLanguage('es');
    });

    expect(i18n.language).toBe('es');
  });

  it('persists language to localStorage via store setLanguage', () => {
    renderHook(() => useLanguageSync());

    act(() => {
      useAppPreferencesStore.getState().setLanguage('es');
    });

    expect(localStorage.getItem('task-manager-language')).toBe('es');
  });
});
