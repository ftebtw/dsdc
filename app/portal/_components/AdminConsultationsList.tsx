"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import {
  consultationStatusClass,
  consultationStatusLabel,
  consultationStatusOptions,
  type ConsultationStatus,
} from '@/app/portal/admin/consultations/config';
import { updateConsultationStatuses } from '@/app/portal/admin/consultations/actions';

type ConsultationListItem = {
  id: string;
  consultDate: string;
  studentName: string;
  parentName: string;
  studentGrade: string;
  howFoundUs: string;
  recommendedClass: string;
  statuses: string[];
};

type Props = {
  consultations: ConsultationListItem[];
};

function StatusBadges({ statuses }: { statuses: string[] }) {
  if (statuses.length === 0) {
    return (
      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${consultationStatusClass(undefined)}`}>
        {consultationStatusLabel(undefined)}
      </span>
    );
  }
  return (
    <div className="flex flex-wrap gap-1">
      {statuses.map((status) => (
        <span
          key={status}
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${consultationStatusClass(status)}`}
        >
          {consultationStatusLabel(status)}
        </span>
      ))}
    </div>
  );
}

type StatusEditorProps = {
  consultationId: string;
  studentName: string;
  statuses: string[];
  onChange: (next: string[]) => void;
  onError: (message: string | null) => void;
};

function StatusEditor({ consultationId, studentName, statuses, onChange, onError }: StatusEditorProps) {
  const [isPending, startTransition] = useTransition();
  const detailsRef = useRef<HTMLDetailsElement>(null);

  // Close the popover when clicking outside.
  useEffect(() => {
    function handle(event: MouseEvent) {
      const el = detailsRef.current;
      if (!el || !el.open) return;
      if (event.target instanceof Node && el.contains(event.target)) return;
      el.open = false;
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  function toggle(value: ConsultationStatus, checked: boolean) {
    const next = checked
      ? statuses.includes(value)
        ? statuses
        : [...statuses, value]
      : statuses.filter((entry) => entry !== value);
    const previous = statuses;
    onChange(next);
    onError(null);
    startTransition(async () => {
      const result = await updateConsultationStatuses(consultationId, next);
      if (!result?.ok) {
        onError(result?.error ?? 'Could not update consultation status.');
        onChange(previous);
      } else if (result.statuses) {
        onChange(result.statuses);
      }
    });
  }

  return (
    <details
      ref={detailsRef}
      className="relative"
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <summary
        className="inline-flex cursor-pointer list-none items-center gap-1 rounded-md border border-warm-300 bg-white px-2 py-1 text-xs font-medium text-charcoal hover:bg-warm-50 dark:border-navy-600 dark:bg-navy-900 dark:text-navy-100 dark:hover:bg-navy-800"
        aria-label={`Edit status for ${studentName}`}
      >
        <span>Edit</span>
        {isPending ? (
          <span className="ml-1 h-3 w-3 animate-spin rounded-full border-2 border-charcoal/30 border-t-charcoal dark:border-navy-300/40 dark:border-t-navy-100" />
        ) : (
          <svg width="10" height="10" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </summary>
      <div className="absolute right-0 z-20 mt-1 w-56 rounded-lg border border-warm-200 bg-white p-2 shadow-lg dark:border-navy-600 dark:bg-navy-900">
        <p className="px-1 pb-1 text-[11px] uppercase tracking-wide text-charcoal/55 dark:text-navy-400">
          Statuses
        </p>
        <div className="space-y-1">
          {consultationStatusOptions.map((option) => {
            const checked = statuses.includes(option.value);
            return (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm text-charcoal hover:bg-warm-50 dark:text-navy-100 dark:hover:bg-navy-800"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={isPending}
                  onChange={(event) => toggle(option.value, event.target.checked)}
                />
                <span>{option.label}</span>
              </label>
            );
          })}
        </div>
      </div>
    </details>
  );
}

export default function AdminConsultationsList({ consultations }: Props) {
  const router = useRouter();
  const [localStatuses, setLocalStatuses] = useState<Record<string, string[]>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function openConsultation(id: string) {
    router.push(`/portal/admin/consultations/${id}`);
  }

  function statusesFor(id: string, fallback: string[]): string[] {
    return localStatuses[id] ?? fallback;
  }

  function setStatusesFor(id: string, next: string[]) {
    setLocalStatuses((prev) => ({ ...prev, [id]: next }));
  }

  if (consultations.length === 0) {
    return <p className="text-sm text-charcoal/70 dark:text-navy-300">No consultations found for the selected filters.</p>;
  }

  return (
    <>
      {errorMessage ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
          {errorMessage}
        </div>
      ) : null}

      <div className="hidden md:block rounded-xl border border-warm-200 dark:border-navy-600 overflow-x-auto">
        <table className="w-full min-w-[980px] text-sm">
          <thead className="bg-warm-100 dark:bg-navy-900/60">
            <tr>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Student Name</th>
              <th className="px-4 py-3 text-left">Parent Name</th>
              <th className="px-4 py-3 text-left">Grade</th>
              <th className="px-4 py-3 text-left">How Found Us</th>
              <th className="px-4 py-3 text-left">Recommended Class</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {consultations.map((consultation) => {
              const currentStatuses = statusesFor(consultation.id, consultation.statuses);
              return (
                <tr
                  key={consultation.id}
                  role="link"
                  tabIndex={0}
                  onClick={() => openConsultation(consultation.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      openConsultation(consultation.id);
                    }
                  }}
                  className="cursor-pointer border-t border-warm-200 dark:border-navy-700 hover:bg-warm-50 dark:hover:bg-navy-800/60 focus:outline-none focus:bg-warm-50 dark:focus:bg-navy-800/60"
                >
                  <td className="px-4 py-3">{consultation.consultDate}</td>
                  <td className="px-4 py-3 font-medium text-navy-800 dark:text-white">{consultation.studentName}</td>
                  <td className="px-4 py-3">{consultation.parentName}</td>
                  <td className="px-4 py-3">{consultation.studentGrade}</td>
                  <td className="px-4 py-3">{consultation.howFoundUs}</td>
                  <td className="px-4 py-3">{consultation.recommendedClass}</td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-col items-start gap-2">
                      <StatusBadges statuses={currentStatuses} />
                      <StatusEditor
                        consultationId={consultation.id}
                        studentName={consultation.studentName}
                        statuses={currentStatuses}
                        onChange={(next) => setStatusesFor(consultation.id, next)}
                        onError={setErrorMessage}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/portal/admin/consultations/${consultation.id}`}
                      onClick={(event) => event.stopPropagation()}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {consultations.map((consultation) => {
          const currentStatuses = statusesFor(consultation.id, consultation.statuses);
          return (
            <article
              key={consultation.id}
              role="link"
              tabIndex={0}
              onClick={() => openConsultation(consultation.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  openConsultation(consultation.id);
                }
              }}
              className="cursor-pointer rounded-xl border border-warm-200 dark:border-navy-600 bg-warm-50 dark:bg-navy-900 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-navy-800 dark:text-white">{consultation.studentName}</p>
                  <p className="text-sm text-charcoal/65 dark:text-navy-300">{consultation.parentName}</p>
                </div>
                <StatusBadges statuses={currentStatuses} />
              </div>
              <div className="mt-3 space-y-1 text-sm text-charcoal/75 dark:text-navy-300">
                <p>Date: {consultation.consultDate}</p>
                <p>Grade: {consultation.studentGrade}</p>
                <p>How Found Us: {consultation.howFoundUs}</p>
                <p>Recommended Class: {consultation.recommendedClass}</p>
              </div>
              <div className="mt-3">
                <StatusEditor
                  consultationId={consultation.id}
                  studentName={consultation.studentName}
                  statuses={currentStatuses}
                  onChange={(next) => setStatusesFor(consultation.id, next)}
                  onError={setErrorMessage}
                />
              </div>
              <div className="mt-3">
                <Link
                  href={`/portal/admin/consultations/${consultation.id}`}
                  onClick={(event) => event.stopPropagation()}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Open consultation
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
