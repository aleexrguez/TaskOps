import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const legalLinks = [
  { to: '/privacy', labelKey: 'footer.privacy' },
  { to: '/terms', labelKey: 'footer.terms' },
  { to: '/cookies', labelKey: 'footer.cookies' },
  { to: '/legal', labelKey: 'footer.legal' },
] as const;

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  const { t } = useTranslation('legal');

  return (
    <footer
      className={`border-t border-gray-200 px-6 py-6 text-center text-sm text-gray-500 sm:px-8 dark:border-gray-700 dark:text-gray-400 ${className ?? ''}`}
    >
      <nav className="mb-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        {legalLinks.map(({ to, labelKey }) => (
          <Link
            key={to}
            to={to}
            className="transition-colors hover:text-gray-700 dark:hover:text-gray-200"
          >
            {t(labelKey)}
          </Link>
        ))}
      </nav>
      <p>{t('footer.copyright')}</p>
    </footer>
  );
}
