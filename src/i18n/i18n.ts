import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import commonEN from './locales/en/common.json';
import commonES from './locales/es/common.json';
import settingsEN from './locales/en/settings.json';
import settingsES from './locales/es/settings.json';
import inboxEN from './locales/en/inbox.json';
import inboxES from './locales/es/inbox.json';
import taskEN from './locales/en/task.json';
import taskES from './locales/es/task.json';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      common: commonEN,
      settings: settingsEN,
      inbox: inboxEN,
      task: taskEN,
    },
    es: {
      common: commonES,
      settings: settingsES,
      inbox: inboxES,
      task: taskES,
    },
  },
  lng: 'en',
  fallbackLng: 'en',
  defaultNS: 'common',
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;
