import { ToastContainer } from '@/features/task-manager/components';
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
