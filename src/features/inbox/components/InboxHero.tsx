interface InboxHeroProps {
  greeting: string;
  displayName: string;
}

export function InboxHero({ greeting, displayName }: InboxHeroProps) {
  return (
    <div>
      <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        {greeting}, {displayName}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        What do you want to capture today?
      </p>
    </div>
  );
}
