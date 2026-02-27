export function GenericPageSkeleton() {
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
    </div>
  );
}

export function ListPageSkeleton() {
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

export function CalendarPageSkeleton() {
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
            <div
              key={i}
              className="h-20 rounded bg-warm-50 dark:bg-navy-800/50 border border-warm-100 dark:border-navy-700/30"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function FormPageSkeleton() {
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
