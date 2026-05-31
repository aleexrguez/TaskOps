import { useTranslation } from 'react-i18next';

export function TechStackSection() {
  const { t } = useTranslation('landing');
  const items = t('techStack.items', { returnObjects: true }) as string[];

  return (
    <section className="border-t border-gray-200 bg-white px-6 py-12 sm:px-8 dark:border-gray-700 dark:bg-gray-800">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t('techStack.heading')}
        </h2>
        <div className="flex flex-wrap justify-center gap-2">
          {items.map((item) => (
            <span
              key={item}
              className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 dark:bg-gray-700 dark:text-gray-300"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
