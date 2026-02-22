import type { ReactNode } from 'react';

export default function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-warm-200 dark:border-navy-700 bg-white dark:bg-navy-800 p-5">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-navy-800 dark:text-white">{title}</h2>
        {description ? (
          <p className="text-sm text-charcoal/65 dark:text-navy-300 mt-1">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
