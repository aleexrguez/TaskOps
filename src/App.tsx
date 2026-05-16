import { ToastContainer } from '@/shared/components/ToastContainer';
import { QueryProvider, AuthProvider } from '@/providers';
import { Router } from '@/router/Router';

export default function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <Router />
        <ToastContainer />
      </AuthProvider>
    </QueryProvider>
  );
}
