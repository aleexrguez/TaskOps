interface AuthDividerProps {
  text: string;
}

export function AuthDivider({ text }: AuthDividerProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-gray-300 dark:bg-gray-600" />
      <span className="text-xs text-gray-400 dark:text-gray-500">{text}</span>
      <div className="h-px flex-1 bg-gray-300 dark:bg-gray-600" />
    </div>
  );
}
