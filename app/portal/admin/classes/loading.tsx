export default function Loading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-7 w-48 rounded-lg bg-warm-200 dark:bg-navy-700" />
      <div className="h-4 w-72 rounded bg-warm-200 dark:bg-navy-700" />
      <div className="mt-6 rounded-xl border border-warm-200 dark:border-navy-700 bg-white dark:bg-navy-900/50 overflow-hidden">
        <div className="h-10 bg-warm-100 dark:bg-navy-800 border-b border-warm-200 dark:border-navy-700" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-4 p-4 border-b border-warm-100 dark:border-navy-700/50">
            <div className="h-4 w-1/4 rounded bg-warm-200 dark:bg-navy-700" />
            <div className="h-4 w-1/3 rounded bg-warm-200 dark:bg-navy-700" />
            <div className="h-4 w-1/6 rounded bg-warm-200 dark:bg-navy-700" />
          </div>
        ))}
      </div>
    </div>
  );
}