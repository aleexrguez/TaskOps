import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { it, expect } from 'vitest';

it('falls back to EN when ES key is missing', async () => {
  const instance = i18next.createInstance();
  await instance.use(initReactI18next).init({
    resources: {
      en: { test: { hello: 'Hello' } },
      es: { test: {} },
    },
    lng: 'es',
    fallbackLng: 'en',
    defaultNS: 'test',
    interpolation: { escapeValue: false },
  });

  expect(instance.t('hello')).toBe('Hello');
});
