import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/i18n';
import { useLanguageSync } from '@/i18n/useLanguageSync';
import { ToastContainer } from '@/shared/components/ToastContainer';
import { QueryProvider, AuthProvider } from '@/providers';
import { Router } from '@/router/Router';

export default function App() {
  useLanguageSync();

  return (
    <I18nextProvider i18n={i18n}>
      <QueryProvider>
        <AuthProvider>
          <Router />
          <ToastContainer />
        </AuthProvider>
      </QueryProvider>
    </I18nextProvider>
  );
}
