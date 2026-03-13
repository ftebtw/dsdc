type KeyFact = {
  label: string;
  value: string;
};

export default function KeyFactsBox({
  title = "Key Facts",
  facts,
  itemType,
}: {
  title?: string;
  facts: KeyFact[];
  itemType: "https://schema.org/Course" | "https://schema.org/EducationalOrganization";
}) {
  return (
    <section className="py-10 md:py-12 bg-white dark:bg-navy-900/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="rounded-2xl border border-warm-200 dark:border-navy-700 bg-warm-50 dark:bg-navy-800/80 p-6 md:p-8 shadow-sm"
          itemScope
          itemType={itemType}
        >
          <h2 className="text-2xl font-bold text-navy-800 dark:text-white mb-6">
            {title}
          </h2>
          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-charcoal/50 dark:text-navy-400">
                  {fact.label}
                </dt>
                <dd className="mt-2 text-sm font-medium leading-relaxed text-navy-800 dark:text-navy-100 sm:text-base">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
