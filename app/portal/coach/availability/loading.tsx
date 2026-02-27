export default function Loading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-7 w-36 rounded-lg bg-warm-200 dark:bg-navy-700" />
      <div className="h-4 w-64 rounded bg-warm-200 dark:bg-navy-700" />
      <div className="mt-6 rounded-xl border border-warm-200 dark:border-navy-700 bg-white dark:bg-navy-900/50 p-4">
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={`h${i}`} className="h-6 rounded bg-warm-100 dark:bg-navy-800" />
          ))}
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="h-20 rounded bg-warm-50 dark:bg-navy-800/50 border border-warm-100 dark:border-navy-700/30" />
          ))}
        </div>
      </div>
    </div>
  );
}