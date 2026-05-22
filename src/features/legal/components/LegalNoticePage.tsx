import { useTranslation } from 'react-i18next';
import { LegalPageLayout } from './LegalPageLayout';
import { LegalSection } from './LegalSection';

const LEGAL_LAST_UPDATED = '2026-05-21';
const LEGAL_OPERATOR_NAME = 'TaskOps';
const LEGAL_CONTACT_EMAIL = ''; // Set your real contact email here

export function LegalNoticePage() {
  const { t } = useTranslation('legal');

  return (
    <LegalPageLayout>
      <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
        {t('legalNotice.title')}
      </h1>
      <p className="mb-8 text-sm text-gray-500 dark:text-gray-400">
        {t('legalNotice.lastUpdated', { date: LEGAL_LAST_UPDATED })}
      </p>

      <LegalSection
        title={t('legalNotice.operator.title')}
        content={t('legalNotice.operator.content', {
          operatorName: LEGAL_OPERATOR_NAME,
        })}
      />

      <LegalSection
        title={t('legalNotice.contact.title')}
        content={
          LEGAL_CONTACT_EMAIL
            ? t('legalNotice.contact.contentWithEmail', {
                contactEmail: LEGAL_CONTACT_EMAIL,
              })
            : t('legalNotice.contact.contentPending')
        }
      />

      <LegalSection
        title={t('legalNotice.hosting.title')}
        items={
          t('legalNotice.hosting.items', { returnObjects: true }) as string[]
        }
      />

      <LegalSection
        title={t('legalNotice.disclaimer.title')}
        items={
          t('legalNotice.disclaimer.items', {
            returnObjects: true,
          }) as string[]
        }
      />
    </LegalPageLayout>
  );
}
