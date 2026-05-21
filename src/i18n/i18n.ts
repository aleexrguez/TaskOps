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
import accountEN from './locales/en/account.json';
import accountES from './locales/es/account.json';
import reportsEN from './locales/en/reports.json';
import reportsES from './locales/es/reports.json';
import recurrenceEN from './locales/en/recurrence.json';
import recurrenceES from './locales/es/recurrence.json';
import landingEN from './locales/en/landing.json';
import landingES from './locales/es/landing.json';
import authEN from './locales/en/auth.json';
import authES from './locales/es/auth.json';
import legalEN from './locales/en/legal.json';
import legalES from './locales/es/legal.json';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      common: commonEN,
      settings: settingsEN,
      inbox: inboxEN,
      task: taskEN,
      account: accountEN,
      reports: reportsEN,
      recurrence: recurrenceEN,
      landing: landingEN,
      auth: authEN,
      legal: legalEN,
    },
    es: {
      common: commonES,
      settings: settingsES,
      inbox: inboxES,
      task: taskES,
      account: accountES,
      reports: reportsES,
      recurrence: recurrenceES,
      landing: landingES,
      auth: authES,
      legal: legalES,
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
