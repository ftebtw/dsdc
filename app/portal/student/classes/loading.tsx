export default function StudentClassesLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-7 w-56 rounded-lg bg-warm-200 dark:bg-navy-700" />
      <div className="h-4 w-80 rounded bg-warm-200 dark:bg-navy-700" />
      <div className="grid sm:grid-cols-4 gap-3 mt-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-warm-200 dark:border-navy-700 bg-white dark:bg-navy-900/50 p-4 space-y-2"
          >
            <div className="h-3 w-20 rounded bg-warm-200 dark:bg-navy-700" />
            <div className="h-8 w-12 rounded bg-warm-200 dark:bg-navy-700" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-warm-200 dark:border-navy-700 bg-white dark:bg-navy-900/50 p-6 space-y-3">
        <div className="h-4 w-full rounded bg-warm-200 dark:bg-navy-700" />
        <div className="h-4 w-5/6 rounded bg-warm-200 dark:bg-navy-700" />
        <div className="h-4 w-4/6 rounded bg-warm-200 dark:bg-navy-700" />
      </div>
    </div>
  );
}
