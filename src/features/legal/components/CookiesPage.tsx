import { useTranslation } from 'react-i18next';
import { LegalPageLayout } from './LegalPageLayout';
import { LegalSection } from './LegalSection';

const sectionKeys = [
  'overview',
  'localStorage',
  'supabaseAuth',
  'thirdParty',
] as const;

export function CookiesPage() {
  const { t } = useTranslation('legal');

  return (
    <LegalPageLayout>
      <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
        {t('cookies.title')}
      </h1>
      <p className="mb-8 text-sm text-gray-500 dark:text-gray-400">
        {t('cookies.lastUpdated', { date: '2026-05-21' })}
      </p>

      {sectionKeys.map((key) => (
        <LegalSection
          key={key}
          title={t(`cookies.${key}.title`)}
          items={t(`cookies.${key}.items`, { returnObjects: true }) as string[]}
        />
      ))}

      <LegalSection
        title={t('cookies.whyNoBanner.title')}
        content={t('cookies.whyNoBanner.content')}
      />
    </LegalPageLayout>
  );
}
