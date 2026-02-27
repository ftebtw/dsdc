export default function Loading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-7 w-48 rounded-lg bg-warm-200 dark:bg-navy-700" />
      <div className="h-4 w-72 rounded bg-warm-200 dark:bg-navy-700" />
      <div className="mt-6 rounded-xl border border-warm-200 dark:border-navy-700 bg-white dark:bg-navy-900/50 p-6 space-y-5">
        <div className="space-y-2">
          <div className="h-3 w-20 rounded bg-warm-200 dark:bg-navy-700" />
          <div className="h-10 w-full rounded-lg bg-warm-100 dark:bg-navy-800" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-24 rounded bg-warm-200 dark:bg-navy-700" />
          <div className="h-10 w-full rounded-lg bg-warm-100 dark:bg-navy-800" />
        </div>
        <div className="h-10 w-32 rounded-lg bg-warm-200 dark:bg-navy-700 mt-4" />
      </div>
    </div>
  );
}