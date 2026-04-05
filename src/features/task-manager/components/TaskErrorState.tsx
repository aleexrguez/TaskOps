interface TaskErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function TaskErrorState({ message, onRetry }: TaskErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-red-200 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-900/20">
      <p className="text-sm font-medium text-red-700 dark:text-red-400">
        {message}
      </p>
      <button
        onClick={onRetry}
        className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
      >
        Retry
      </button>
    </div>
  );
}
