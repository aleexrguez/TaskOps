import { render, screen, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import i18n from '@/i18n/i18n';
import { InboxPage } from '../InboxPage';

describe('InboxPage i18n', () => {
  it('renders heading in English by default', () => {
    render(
      <InboxPage itemCount={0} quickInput={<div>input</div>}>
        <div>content</div>
      </InboxPage>,
    );

    expect(screen.getByText('Inbox')).toBeInTheDocument();
  });

  it('renders heading in Spanish when language is es', async () => {
    await act(async () => {
      await i18n.changeLanguage('es');
    });

    render(
      <InboxPage itemCount={0} quickInput={<div>input</div>}>
        <div>content</div>
      </InboxPage>,
    );

    expect(screen.getByText('Bandeja')).toBeInTheDocument();

    await act(async () => {
      await i18n.changeLanguage('en');
    });
  });
});
