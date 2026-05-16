export function InboxEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-3 text-4xl">📥</div>
      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
        Your inbox is empty
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Capture quick ideas above — organize them later.
      </p>
    </div>
  );
}
