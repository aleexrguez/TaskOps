import { useNavigate } from 'react-router-dom';
import { useSignUp } from '../hooks';
import { RegisterForm } from '../components';
import type { RegisterInput } from '../types';

export function RegisterContainer() {
  const navigate = useNavigate();
  const { signUp, isPending, error } = useSignUp();

  async function handleSubmit(data: RegisterInput): Promise<void> {
    try {
      await signUp(data.email, data.password);
      navigate('/app');
    } catch {
      // error is already set in the hook
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-xl dark:bg-gray-800">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
          TaskManager
        </h1>
        <RegisterForm
          onSubmit={handleSubmit}
          isPending={isPending}
          error={error}
        />
      </div>
    </div>
  );
}
