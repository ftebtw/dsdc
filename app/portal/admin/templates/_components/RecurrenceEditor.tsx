"use client";

import { WEEK_DAYS, type Recurrence, type WeekDay } from "./types";

export default function RecurrenceEditor({
  value,
  onChange,
}: {
  value: Recurrence;
  onChange: (next: Recurrence) => void;
}) {
  function toggleDay(day: WeekDay) {
    const next = value.daysOfWeek.includes(day)
      ? value.daysOfWeek.filter((d) => d !== day)
      : [...value.daysOfWeek, day];
    const order: Record<WeekDay, number> = { mon: 0, tue: 1, wed: 2, thu: 3, fri: 4, sat: 5, sun: 6 };
    next.sort((a, b) => order[a] - order[b]);
    onChange({ ...value, daysOfWeek: next });
  }

  return (
    <div className="space-y-3 rounded-xl border border-warm-200 dark:border-navy-600/70 bg-warm-50/50 dark:bg-navy-900/40 p-3">
      <div className="flex items-center gap-2 text-sm">
        <label className="text-charcoal/80 dark:text-navy-100/85">Starts on</label>
        <input
          type="date"
          value={value.startDate}
          onChange={(e) => onChange({ ...value, startDate: e.target.value })}
          className="rounded-md border border-warm-300 dark:border-navy-500 bg-white dark:bg-navy-800 px-2 py-1 text-charcoal dark:text-white"
        />
      </div>

      <div className="flex items-center gap-2 text-sm">
        <label className="text-charcoal/80 dark:text-navy-100/85">Repeats every</label>
        <input
          type="number"
          min={1}
          max={12}
          value={value.intervalWeeks}
          onChange={(e) => onChange({ ...value, intervalWeeks: Math.max(1, parseInt(e.target.value, 10) || 1) })}
          className="w-16 rounded-md border border-warm-300 dark:border-navy-500 bg-white dark:bg-navy-800 px-2 py-1 text-charcoal dark:text-white"
        />
        <span className="text-charcoal/80 dark:text-navy-100/85">week(s)</span>
      </div>

      <div>
        <div className="mb-1.5 text-sm text-charcoal/80 dark:text-navy-100/85">Repeats on</div>
        <div className="flex flex-wrap gap-1.5">
          {WEEK_DAYS.map((d) => {
            const active = value.daysOfWeek.includes(d.value);
            return (
              <button
                key={d.value}
                type="button"
                onClick={() => toggleDay(d.value)}
                className={`h-9 w-9 rounded-full border text-sm font-semibold transition-colors ${
                  active
                    ? "border-navy-800 bg-navy-800 text-white dark:border-gold-400 dark:bg-gold-400 dark:text-navy-900"
                    : "border-warm-300 bg-white text-charcoal/70 hover:border-navy-400 dark:border-navy-500 dark:bg-navy-800 dark:text-navy-100/70"
                }`}
                aria-pressed={active}
                aria-label={d.long}
                title={d.long}
              >
                {d.short}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="mb-1.5 text-sm text-charcoal/80 dark:text-navy-100/85">Ends</div>
        <div className="space-y-1.5 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="endType"
              checked={value.endType === "never"}
              onChange={() => onChange({ ...value, endType: "never" })}
            />
            <span className="text-charcoal/80 dark:text-navy-100/85">Never</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="endType"
              checked={value.endType === "onDate"}
              onChange={() => onChange({ ...value, endType: "onDate" })}
            />
            <span className="text-charcoal/80 dark:text-navy-100/85">On</span>
            <input
              type="date"
              value={value.endDate}
              onChange={(e) => onChange({ ...value, endType: "onDate", endDate: e.target.value })}
              className="rounded-md border border-warm-300 dark:border-navy-500 bg-white dark:bg-navy-800 px-2 py-1 text-charcoal dark:text-white"
            />
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="endType"
              checked={value.endType === "after"}
              onChange={() => onChange({ ...value, endType: "after" })}
            />
            <span className="text-charcoal/80 dark:text-navy-100/85">After</span>
            <input
              type="number"
              min={1}
              max={99}
              value={value.endAfterCount}
              onChange={(e) =>
                onChange({
                  ...value,
                  endType: "after",
                  endAfterCount: Math.max(1, parseInt(e.target.value, 10) || 1),
                })
              }
              className="w-16 rounded-md border border-warm-300 dark:border-navy-500 bg-white dark:bg-navy-800 px-2 py-1 text-charcoal dark:text-white"
            />
            <span className="text-charcoal/80 dark:text-navy-100/85">occurrences</span>
          </label>
        </div>
      </div>
    </div>
  );
}
