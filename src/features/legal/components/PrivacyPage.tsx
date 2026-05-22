import { useTranslation } from 'react-i18next';
import { LegalPageLayout } from './LegalPageLayout';
import { LegalSection } from './LegalSection';

const sectionKeys = [
  'dataCollected',
  'howWeUse',
  'thirdParties',
  'storage',
  'rights',
] as const;

export function PrivacyPage() {
  const { t } = useTranslation('legal');

  return (
    <LegalPageLayout>
      <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
        {t('privacy.title')}
      </h1>
      <p className="mb-8 text-sm text-gray-500 dark:text-gray-400">
        {t('privacy.lastUpdated', { date: '2026-05-21' })}
      </p>

      {sectionKeys.map((key) => (
        <LegalSection
          key={key}
          title={t(`privacy.${key}.title`)}
          items={t(`privacy.${key}.items`, { returnObjects: true }) as string[]}
        />
      ))}

      <LegalSection
        title={t('privacy.contact.title')}
        content={t('privacy.contact.content')}
      />
    </LegalPageLayout>
  );
}
