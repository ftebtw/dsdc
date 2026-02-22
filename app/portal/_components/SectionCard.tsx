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
    <section className="rounded-2xl border border-warm-200 dark:border-navy-600/70 bg-white/95 dark:bg-navy-800/60 backdrop-blur-sm p-5 shadow-sm dark:shadow-[0_16px_40px_rgba(0,0,0,0.26)]">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-navy-800 dark:text-white">{title}</h2>
        {description ? (
          <p className="text-sm text-charcoal/65 dark:text-navy-200/80 mt-1">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
