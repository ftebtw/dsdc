export default function Loading() {
  return (
    <div className="space-y-6">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-warm-200 dark:border-navy-700 bg-white dark:bg-navy-800 p-6 animate-pulse"
        >
          <div className="h-5 w-48 rounded bg-warm-200 dark:bg-navy-600 mb-3" />
          <div className="h-3 w-72 rounded bg-warm-100 dark:bg-navy-700 mb-4" />
          <div className="space-y-2">
            <div className="h-3 w-full rounded bg-warm-100 dark:bg-navy-700" />
            <div className="h-3 w-3/4 rounded bg-warm-100 dark:bg-navy-700" />
          </div>
        </div>
      ))}
    </div>
  );
}
