interface TaskNotFoundProps {
  onBack: () => void;
}

export function TaskNotFound({ onBack }: TaskNotFoundProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
        Task not found
      </p>
      <button
        onClick={onBack}
        className="rounded-md px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/40"
      >
        Back to dashboard
      </button>
    </div>
  );
}
