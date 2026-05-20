import { useTranslation } from 'react-i18next';

interface InboxHeroProps {
  greeting: string;
  displayName: string;
}

export function InboxHero({ greeting, displayName }: InboxHeroProps) {
  const { t } = useTranslation('inbox');

  return (
    <div>
      <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        {greeting}, {displayName}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {t('hero.subtitle')}
      </p>
    </div>
  );
}
