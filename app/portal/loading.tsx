export default function PortalLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-7 w-48 rounded-lg bg-warm-200 dark:bg-navy-700" />
      <div className="h-4 w-72 rounded bg-warm-200 dark:bg-navy-700" />

      <div className="mt-6 rounded-xl border border-warm-200 dark:border-navy-700 bg-white dark:bg-navy-900/50 p-6 space-y-4">
        <div className="h-4 w-full rounded bg-warm-200 dark:bg-navy-700" />
        <div className="h-4 w-5/6 rounded bg-warm-200 dark:bg-navy-700" />
        <div className="h-4 w-4/6 rounded bg-warm-200 dark:bg-navy-700" />
        <div className="h-10 w-32 rounded-lg bg-warm-200 dark:bg-navy-700 mt-4" />
      </div>

      <div className="rounded-xl border border-warm-200 dark:border-navy-700 bg-white dark:bg-navy-900/50 p-6 space-y-4">
        <div className="h-4 w-3/4 rounded bg-warm-200 dark:bg-navy-700" />
        <div className="h-4 w-2/3 rounded bg-warm-200 dark:bg-navy-700" />
      </div>
    </div>
  );
}
