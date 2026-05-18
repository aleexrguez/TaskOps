export function getGreeting(hour: number): string {
  if (hour >= 5 && hour <= 11) return 'Good morning';
  if (hour >= 12 && hour <= 17) return 'Good afternoon';
  return 'Good evening';
}

export function getDisplayName(
  profile: { display_name: string | null } | null | undefined,
  email: string | undefined,
): string {
  const displayName = profile?.display_name?.trim();
  if (displayName) {
    return displayName.split(/\s+/)[0];
  }

  const username = email?.split('@')[0]?.trim();
  if (username) {
    return username;
  }

  return 'there';
}
