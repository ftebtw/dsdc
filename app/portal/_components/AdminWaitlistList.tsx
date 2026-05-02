"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';
import {
  formatStudentsSummary,
  waitlistStatusClass,
  waitlistStatusLabel,
  waitlistStatusOptions,
  type WaitlistStudent,
} from '@/app/portal/admin/waitlist/config';
import { updateWaitlistStatus } from '@/app/portal/admin/waitlist/actions';

export type WaitlistListItem = {
  id: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  students: WaitlistStudent[];
  hasDebateExperience: boolean;
  debateExperienceDetails: string;
  timezone: string;
  location: string;
  preferredDaysTimes: string;
  notes: string;
  status: string;
  createdAt: string;
};

type Props = {
  entries: WaitlistListItem[];
};

const NO_TIMEZONE_KEY = '__none__';

function groupByTimezone(entries: WaitlistListItem[]) {
  const groups = new Map<string, WaitlistListItem[]>();
  for (const entry of entries) {
    const key = entry.timezone?.trim() || NO_TIMEZONE_KEY;
    const existing = groups.get(key);
    if (existing) {
      existing.push(entry);
    } else {
      groups.set(key, [entry]);
    }
  }
  // Alphabetical order, with "no timezone" pushed to end.
  return Array.from(groups.entries()).sort((a, b) => {
    if (a[0] === NO_TIMEZONE_KEY) return 1;
    if (b[0] === NO_TIMEZONE_KEY) return -1;
    return a[0].localeCompare(b[0]);
  });
}

export default function AdminWaitlistList({ entries }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [localStatuses, setLocalStatuses] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const grouped = useMemo(() => groupByTimezone(entries), [entries]);

  function openEntry(id: string) {
    router.push(`/portal/admin/waitlist/${id}`);
  }

  function currentStatus(id: string, fallback: string) {
    return localStatuses[id] ?? fallback;
  }

  function handleStatusChange(id: string, nextStatus: string) {
    setErrorMessage(null);
    setLocalStatuses((prev) => ({ ...prev, [id]: nextStatus }));
    setPendingId(id);

    startTransition(async () => {
      const result = await updateWaitlistStatus(id, nextStatus);

      if (!result?.ok) {
        setErrorMessage(result?.error ?? 'Could not update waitlist status.');
        setLocalStatuses((prev) => {
          const updated = { ...prev };
          delete updated[id];
          return updated;
        });
      } else {
        router.refresh();
      }

      setPendingId(null);
    });
  }

  if (entries.length === 0) {
    return <p className="text-sm text-charcoal/70 dark:text-navy-300">No waitlist entries found for the selected filters.</p>;
  }

  return (
    <>
      {errorMessage ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
          {errorMessage}
        </div>
      ) : null}

      <div className="space-y-8">
        {grouped.map(([timezoneKey, items]) => {
          const heading = timezoneKey === NO_TIMEZONE_KEY ? 'No timezone set' : timezoneKey;
          return (
            <section key={timezoneKey} className="space-y-3">
              <div className="flex items-baseline gap-3">
                <h3 className="text-lg font-semibold text-navy-800 dark:text-white">{heading}</h3>
                <span className="text-sm text-charcoal/65 dark:text-navy-300">
                  {items.length} {items.length === 1 ? 'entry' : 'entries'}
                </span>
              </div>

              <div className="hidden md:block rounded-xl border border-warm-200 dark:border-navy-600 overflow-x-auto">
                <table className="w-full min-w-[1100px] text-sm">
                  <thead className="bg-warm-100 dark:bg-navy-900/60">
                    <tr>
                      <th className="px-4 py-3 text-left">Parent</th>
                      <th className="px-4 py-3 text-left">Contact</th>
                      <th className="px-4 py-3 text-left">Students</th>
                      <th className="px-4 py-3 text-left">Experience</th>
                      <th className="px-4 py-3 text-left">Location</th>
                      <th className="px-4 py-3 text-left">Preferred Days/Times</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((entry) => (
                      <tr
                        key={entry.id}
                        role="link"
                        tabIndex={0}
                        onClick={() => openEntry(entry.id)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            openEntry(entry.id);
                          }
                        }}
                        className="cursor-pointer border-t border-warm-200 dark:border-navy-700 hover:bg-warm-50 dark:hover:bg-navy-800/60 focus:outline-none focus:bg-warm-50 dark:focus:bg-navy-800/60 align-top"
                      >
                        <td className="px-4 py-3 font-medium text-navy-800 dark:text-white">
                          {entry.parentName || '-'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-0.5">
                            {entry.parentEmail ? <p className="text-xs">{entry.parentEmail}</p> : null}
                            {entry.parentPhone ? <p className="text-xs">{entry.parentPhone}</p> : null}
                            {!entry.parentEmail && !entry.parentPhone ? (
                              <span className="text-charcoal/40 dark:text-navy-500">-</span>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-4 py-3">{formatStudentsSummary(entry.students)}</td>
                        <td className="px-4 py-3">
                          {entry.hasDebateExperience ? (
                            <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800 dark:bg-green-900/30 dark:text-green-300">
                              Yes
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-warm-200 px-2 py-0.5 text-xs font-semibold text-charcoal/70 dark:bg-navy-800 dark:text-navy-300">
                              No
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">{entry.location || '-'}</td>
                        <td className="px-4 py-3">
                          <span className="line-clamp-2 whitespace-pre-wrap">
                            {entry.preferredDaysTimes || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${waitlistStatusClass(currentStatus(entry.id, entry.status))}`}>
                              {waitlistStatusLabel(currentStatus(entry.id, entry.status))}
                            </span>
                            <select
                              value={currentStatus(entry.id, entry.status)}
                              disabled={isPending && pendingId === entry.id}
                              onClick={(event) => event.stopPropagation()}
                              onChange={(event) => {
                                event.stopPropagation();
                                handleStatusChange(entry.id, event.target.value);
                              }}
                              className="rounded-md border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-2 py-1 text-xs text-charcoal dark:text-navy-100"
                              aria-label={`Change status for ${entry.parentName}`}
                            >
                              {waitlistStatusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/portal/admin/waitlist/${entry.id}`}
                            onClick={(event) => event.stopPropagation()}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Open
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 md:hidden">
                {items.map((entry) => (
                  <article
                    key={entry.id}
                    role="link"
                    tabIndex={0}
                    onClick={() => openEntry(entry.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        openEntry(entry.id);
                      }
                    }}
                    className="cursor-pointer rounded-xl border border-warm-200 dark:border-navy-600 bg-warm-50 dark:bg-navy-900 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-navy-800 dark:text-white">{entry.parentName || '-'}</p>
                        <p className="text-sm text-charcoal/65 dark:text-navy-300">
                          {formatStudentsSummary(entry.students)}
                        </p>
                      </div>
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${waitlistStatusClass(currentStatus(entry.id, entry.status))}`}>
                        {waitlistStatusLabel(currentStatus(entry.id, entry.status))}
                      </span>
                    </div>
                    <div className="mt-3 space-y-1 text-sm text-charcoal/75 dark:text-navy-300">
                      {entry.parentEmail ? <p>Email: {entry.parentEmail}</p> : null}
                      {entry.parentPhone ? <p>Phone: {entry.parentPhone}</p> : null}
                      {entry.location ? <p>Location: {entry.location}</p> : null}
                      <p>Experience: {entry.hasDebateExperience ? 'Yes' : 'No'}</p>
                      {entry.preferredDaysTimes ? (
                        <p className="whitespace-pre-wrap">Preferred: {entry.preferredDaysTimes}</p>
                      ) : null}
                    </div>
                    <div className="mt-3">
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-charcoal/55 dark:text-navy-400">
                        Status
                      </label>
                      <select
                        value={currentStatus(entry.id, entry.status)}
                        disabled={isPending && pendingId === entry.id}
                        onClick={(event) => event.stopPropagation()}
                        onChange={(event) => {
                          event.stopPropagation();
                          handleStatusChange(entry.id, event.target.value);
                        }}
                        className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2 text-sm text-charcoal dark:text-navy-100"
                        aria-label={`Change status for ${entry.parentName}`}
                      >
                        {waitlistStatusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mt-3">
                      <Link
                        href={`/portal/admin/waitlist/${entry.id}`}
                        onClick={(event) => event.stopPropagation()}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Open entry
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
