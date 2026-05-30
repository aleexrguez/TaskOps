import { useTranslation } from 'react-i18next';

interface RoadmapItem {
  title: string;
  description: string;
}

export function RoadmapSection() {
  const { t } = useTranslation('landing');
  const items = t('roadmap.items', { returnObjects: true }) as RoadmapItem[];

  return (
    <section className="border-t border-gray-200 bg-gray-50 px-4 py-16 dark:border-gray-700 dark:bg-gray-900">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-2 text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t('roadmap.heading')}
        </h2>
        <p className="mb-10 text-center text-sm text-gray-600 dark:text-gray-400">
          {t('roadmap.subheading')}
        </p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.title}
              className="rounded-lg border border-gray-200 p-6 dark:border-gray-700"
            >
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
