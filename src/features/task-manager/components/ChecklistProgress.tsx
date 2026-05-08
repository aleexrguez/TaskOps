interface ChecklistProgressProps {
  completed: number;
  total: number;
}

export function ChecklistProgress({
  completed,
  total,
}: ChecklistProgressProps) {
  if (total === 0) return null;

  const percentage = Math.round((completed / total) * 100);
  const isComplete = completed === total;

  return (
    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
      <span>
        {completed}/{total}
      </span>
      <div
        role="progressbar"
        aria-valuenow={completed}
        aria-valuemin={0}
        aria-valuemax={total}
        className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
      >
        <div
          className={`h-full rounded-full transition-all ${
            isComplete ? 'bg-green-500' : 'bg-indigo-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
