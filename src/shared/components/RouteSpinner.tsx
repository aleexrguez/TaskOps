interface RouteSpinnerProps {
  fullScreen?: boolean;
}

export function RouteSpinner({ fullScreen = false }: RouteSpinnerProps) {
  const containerClass = fullScreen
    ? 'flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900'
    : 'flex items-center justify-center py-32';

  return (
    <div role="status" aria-label="Loading" className={containerClass}>
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-indigo-600" />
    </div>
  );
}
