import { useTranslation } from 'react-i18next';
import { LegalPageLayout } from './LegalPageLayout';
import { LegalSection } from './LegalSection';

const sectionKeys = [
  'description',
  'responsibilities',
  'ip',
  'availability',
  'termination',
  'liability',
] as const;

export function TermsPage() {
  const { t } = useTranslation('legal');

  return (
    <LegalPageLayout>
      <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
        {t('terms.title')}
      </h1>
      <p className="mb-8 text-sm text-gray-500 dark:text-gray-400">
        {t('terms.lastUpdated', { date: '2026-05-21' })}
      </p>

      {sectionKeys.map((key) => (
        <LegalSection
          key={key}
          title={t(`terms.${key}.title`)}
          items={t(`terms.${key}.items`, { returnObjects: true }) as string[]}
        />
      ))}

      <LegalSection
        title={t('terms.changes.title')}
        content={t('terms.changes.content')}
      />
    </LegalPageLayout>
  );
}
