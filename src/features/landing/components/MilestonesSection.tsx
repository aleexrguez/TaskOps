import { useTranslation } from 'react-i18next';

export function MilestonesSection() {
  const { t } = useTranslation('landing');
  const items = t('milestones.items', { returnObjects: true }) as string[];

  return (
    <section className="border-t border-gray-200 bg-white px-4 py-16 dark:border-gray-700 dark:bg-gray-800">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-10 text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t('milestones.heading')}
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <div key={item} className="flex items-start gap-3">
              <span
                className="mt-0.5 flex-shrink-0 text-green-500"
                aria-hidden="true"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
