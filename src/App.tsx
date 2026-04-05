import { ToastContainer } from '@/features/task-manager/components';
import { QueryProvider } from '@/providers';
import { Router } from '@/router/Router';

export default function App() {
  return (
    <QueryProvider>
      <Router />
      <ToastContainer />
    </QueryProvider>
  );
}
