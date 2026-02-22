"use client";

import { useState } from 'react';
import AbsenceForm from '@/app/portal/_components/AbsenceForm';
import type { Database } from '@/lib/supabase/database.types';

type ClassOption = {
  id: string;
  name: string;
  schedule_day: Database['public']['Enums']['schedule_day'];
  timezone: string;
};

type AbsenceItem = {
  id: string;
  className: string;
  session_date: string;
  reason: string | null;
  reported_at: string;
};

export default function PortalAbsenceManager({
  classes,
  initialAbsences,
  studentId,
}: {
  classes: ClassOption[];
  initialAbsences: AbsenceItem[];
  studentId?: string;
}) {
  const [absences, setAbsences] = useState<AbsenceItem[]>(initialAbsences);

  async function submitAbsence(payload: { classId: string; sessionDate: string; reason: string }) {
    const response = await fetch('/api/portal/absences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        classId: payload.classId,
        sessionDate: payload.sessionDate,
        reason: payload.reason,
        studentId,
      }),
    });
    const data = (await response.json()) as { error?: string; absence?: any };
    if (!response.ok || !data.absence) {
      return { ok: false, error: data.error || 'Could not report absence.' };
    }

    const className = classes.find((classRow) => classRow.id === payload.classId)?.name || payload.classId;
    setAbsences((prev) => [
      {
        id: data.absence.id,
        className,
        session_date: data.absence.session_date,
        reason: data.absence.reason || null,
        reported_at: data.absence.reported_at,
      },
      ...prev,
    ]);

    return { ok: true, message: 'Absence reported successfully.' };
  }

  return (
    <div className="space-y-4">
      <AbsenceForm classes={classes} onSubmit={submitAbsence} />
      <div className="space-y-2">
        <h3 className="font-semibold text-navy-800 dark:text-white">Reported Absences</h3>
        {absences.length === 0 ? (
          <p className="text-sm text-charcoal/70 dark:text-navy-300">No absences reported yet.</p>
        ) : (
          absences.map((absence) => (
            <article
              key={absence.id}
              className="rounded-lg border border-warm-200 dark:border-navy-600 p-3 bg-white dark:bg-navy-900"
            >
              <p className="text-sm font-medium text-navy-800 dark:text-white">
                {absence.className} - {absence.session_date}
              </p>
              <p className="text-sm text-charcoal/70 dark:text-navy-300">{absence.reason || 'No reason provided.'}</p>
              <p className="text-xs text-charcoal/60 dark:text-navy-300 mt-1">
                Reported {new Date(absence.reported_at).toLocaleString()}
              </p>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
