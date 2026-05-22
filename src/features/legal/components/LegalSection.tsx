interface LegalSectionProps {
  title: string;
  items?: string[];
  content?: string;
}

export function LegalSection({ title, items, content }: LegalSectionProps) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h2>
      {items && (
        <ul className="list-disc space-y-2 pl-5 text-gray-600 dark:text-gray-400">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )}
      {content && <p className="text-gray-600 dark:text-gray-400">{content}</p>}
    </section>
  );
}
