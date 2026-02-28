"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { attendanceStatusOptions } from '@/lib/portal/labels';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';
import { useI18n } from '@/lib/i18n';
import { portalT } from '@/lib/portal/parent-i18n';

type AttendanceStatus = Database['public']['Enums']['attendance_status'];

type Student = {
  id: string;
  display_name: string | null;
  email: string;
};

type AttendanceRow = {
  status: AttendanceStatus | null;
  camera_on: boolean | null;
  marked_at?: string;
  saving?: boolean;
  saveError?: string | null;
};

type Props = {
  classId: string;
  userId: string;
  initialSessionDate: string;
  students: Student[];
  initialAttendance: Record<string, AttendanceRow>;
  initialAbsenceStudentIds: string[];
};

function blankRow(): AttendanceRow {
  return { status: null, camera_on: null, saveError: null };
}

export default function CoachAttendanceEditor({
  classId,
  userId,
  initialSessionDate,
  students,
  initialAttendance,
  initialAbsenceStudentIds,
}: Props) {
  const { locale } = useI18n();
  const t = (key: string, fallback: string) => portalT(locale, key, fallback);
  const [sessionDate, setSessionDate] = useState(initialSessionDate);
  const [attendance, setAttendance] = useState<Record<string, AttendanceRow>>(initialAttendance);
  const [absenceStudentIds, setAbsenceStudentIds] = useState<Set<string>>(
    new Set(initialAbsenceStudentIds)
  );
  const [loadingDate, setLoadingDate] = useState(false);
  const [submittingAll, setSubmittingAll] = useState(false);
  const [submitAllResult, setSubmitAllResult] = useState<string | null>(null);
  const timerRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const studentRows = useMemo(() => {
    return students.map((student) => {
      const record = attendance[student.id] ?? blankRow();
      return { student, record };
    });
  }, [students, attendance]);

  useEffect(() => {
    return () => {
      for (const key of Object.keys(timerRef.current)) {
        clearTimeout(timerRef.current[key]);
      }
    };
  }, []);

  async function refreshForDate(date: string) {
    setLoadingDate(true);
    const supabase = getSupabaseBrowserClient();

    const [attendanceResult, absenceResult] = await Promise.all([
      supabase
        .from('attendance_records')
        .select('student_id,status,camera_on,marked_at')
        .eq('class_id', classId)
        .eq('session_date', date),
      supabase
        .from('student_absences')
        .select('student_id')
        .eq('class_id', classId)
        .eq('session_date', date),
    ]);

    const nextAttendance: Record<string, AttendanceRow> = {};
    for (const row of attendanceResult.data ?? []) {
      nextAttendance[row.student_id] = {
        status: row.status,
        camera_on: row.camera_on,
        marked_at: row.marked_at,
        saveError: null,
      };
    }

    setAttendance(nextAttendance);
    setAbsenceStudentIds(new Set((absenceResult.data ?? []).map((item: any) => item.student_id)));
    setLoadingDate(false);
  }

  async function persist(studentId: string, nextRecord: AttendanceRow, date: string) {
    if (!nextRecord.status) return;

    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from('attendance_records').upsert(
      {
        class_id: classId,
        student_id: studentId,
        session_date: date,
        status: nextRecord.status,
        camera_on: nextRecord.camera_on ?? false,
        marked_by: userId,
        marked_at: new Date().toISOString(),
      },
      { onConflict: 'class_id,student_id,session_date' }
    );

    setAttendance((prev) => ({
      ...prev,
      [studentId]: {
        ...nextRecord,
        saving: false,
        saveError: error ? error.message : null,
      },
    }));
  }

  function scheduleSave(studentId: string, nextRecord: AttendanceRow) {
    if (timerRef.current[studentId]) {
      clearTimeout(timerRef.current[studentId]);
    }
    timerRef.current[studentId] = setTimeout(() => {
      void persist(studentId, nextRecord, sessionDate);
    }, 500);
  }

  function updateStudentRecord(studentId: string, updates: Partial<AttendanceRow>) {
    setAttendance((prev) => {
      const current = prev[studentId] ?? blankRow();
      const nextRecord: AttendanceRow = {
        ...current,
        ...updates,
        saveError: null,
      };

      if (nextRecord.status) {
        nextRecord.saving = true;
        scheduleSave(studentId, nextRecord);
      }

      return { ...prev, [studentId]: nextRecord };
    });
  }

  async function submitAll() {
    setSubmittingAll(true);
    setSubmitAllResult(null);

    const supabase = getSupabaseBrowserClient();
    const rows = students
      .map((student) => {
        const record = attendance[student.id];
        if (!record?.status) return null;

        return {
          class_id: classId,
          student_id: student.id,
          session_date: sessionDate,
          status: record.status,
          camera_on: record.camera_on ?? false,
          marked_by: userId,
          marked_at: new Date().toISOString(),
        };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null);

    if (rows.length === 0) {
      setSubmitAllResult('No students marked yet. Select a status for each student first.');
      setSubmittingAll(false);
      return;
    }

    const { error } = await supabase
      .from('attendance_records')
      .upsert(rows, { onConflict: 'class_id,student_id,session_date' });

    if (error) {
      setSubmitAllResult(`Error: ${error.message}`);
    } else {
      const unmarkedCount = students.length - rows.length;
      setSubmitAllResult(
        `Saved ${rows.length} record(s).${unmarkedCount > 0 ? ` ${unmarkedCount} student(s) still unmarked.` : ''}`
      );

      setAttendance((prev) => {
        const next = { ...prev };
        for (const student of students) {
          if (next[student.id]?.status) {
            next[student.id] = { ...next[student.id], saving: false, saveError: null };
          }
        }
        return next;
      });
    }

    setSubmittingAll(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <label className="text-sm font-medium text-navy-700 dark:text-navy-200">
          {t('portal.coachAttendanceEditor.sessionDate', 'Session date')}
        </label>
        <input
          type="date"
          value={sessionDate}
          onChange={(event) => {
            const nextDate = event.target.value;
            setSessionDate(nextDate);
            void refreshForDate(nextDate);
          }}
          className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
        />
        {loadingDate ? (
          <span className="text-xs text-charcoal/60 dark:text-navy-300">
            {t('portal.coachAttendanceEditor.loadingDate', 'Loading date...')}
          </span>
        ) : null}
      </div>

      <div className="rounded-xl border border-warm-200 dark:border-navy-600 overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-warm-100 dark:bg-navy-900/60">
            <tr>
              <th className="text-left px-4 py-3">{t('portal.common.student', 'Student')}</th>
              <th className="text-left px-4 py-3">{t('portal.common.status', 'Status')}</th>
              <th className="text-left px-4 py-3">{t('portal.student.attendance.camera', 'Camera')}</th>
              <th className="text-left px-4 py-3">
                {t('portal.coachAttendanceEditor.absenceReported', 'Absence Reported')}
              </th>
              <th className="text-left px-4 py-3">{t('portal.coachAttendanceEditor.saveState', 'Save State')}</th>
            </tr>
          </thead>
          <tbody>
            {studentRows.map(({ student, record }) => (
              <tr key={student.id} className="border-t border-warm-200 dark:border-navy-700">
                <td className="px-4 py-3">
                  <p className="font-medium text-navy-800 dark:text-white">
                    {student.display_name || student.email}
                  </p>
                  <p className="text-xs text-charcoal/60 dark:text-navy-300">{student.email}</p>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={record.status ?? ''}
                    onChange={(event) =>
                      updateStudentRecord(student.id, {
                        status: event.target.value as AttendanceStatus,
                      })
                    }
                    className={`rounded-md border px-3 py-2 ${
                      record.status
                        ? 'border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900'
                        : 'border-amber-400 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/20'
                    }`}
                  >
                    <option value="" disabled>
                      — Select —
                    </option>
                    {attendanceStatusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <div className="inline-flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => updateStudentRecord(student.id, { camera_on: true })}
                      className={`px-2.5 py-1 rounded-l-md text-xs font-medium border ${
                        record.camera_on === true
                          ? 'bg-green-600 text-white border-green-700'
                          : 'bg-white dark:bg-navy-900 border-warm-300 dark:border-navy-600 text-charcoal/70 dark:text-navy-300'
                      }`}
                    >
                      {t('portal.student.attendance.cameraOn', 'On')}
                    </button>
                    <button
                      type="button"
                      onClick={() => updateStudentRecord(student.id, { camera_on: false })}
                      className={`px-2.5 py-1 rounded-r-md text-xs font-medium border ${
                        record.camera_on === false
                          ? 'bg-red-600 text-white border-red-700'
                          : 'bg-white dark:bg-navy-900 border-warm-300 dark:border-navy-600 text-charcoal/70 dark:text-navy-300'
                      }`}
                    >
                      {t('portal.student.attendance.cameraOff', 'Off')}
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {absenceStudentIds.has(student.id) ? (
                    <span className="inline-block px-2 py-1 rounded-full text-xs bg-gold-200 text-navy-900">
                      {t('portal.coachAttendanceEditor.reported', 'Reported')}
                    </span>
                  ) : (
                    <span className="text-charcoal/60 dark:text-navy-300">{t('portal.parent.preferences.none', 'No')}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {!record.status ? (
                    <span className="text-xs text-amber-600 dark:text-amber-400">
                      {t('portal.coachAttendanceEditor.notMarked', 'Not marked')}
                    </span>
                  ) : record.saving ? (
                    <span className="text-xs text-navy-600 dark:text-navy-300">
                      {t('portal.common.saving', 'Saving...')}
                    </span>
                  ) : record.saveError ? (
                    <span className="text-xs text-red-700">{record.saveError}</span>
                  ) : (
                    <span className="text-xs text-green-700 dark:text-green-400">
                      {t('portal.rolePreferences.saved', 'Saved.')}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {students.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
          {(() => {
            const unmarkedCount = students.filter((student) => !attendance[student.id]?.status).length;

            return (
              <>
                <button
                  type="button"
                  onClick={submitAll}
                  disabled={submittingAll}
                  className="px-5 py-2.5 rounded-lg bg-navy-800 dark:bg-gold-300 text-white dark:text-navy-900 font-semibold disabled:opacity-60"
                >
                  {submittingAll
                    ? t('portal.common.saving', 'Saving...')
                    : t('portal.coachAttendanceEditor.submitAll', 'Submit All Attendance')}
                </button>
                {unmarkedCount > 0 ? (
                  <span className="text-sm text-amber-600 dark:text-amber-400">
                    {unmarkedCount} student(s) not yet marked
                  </span>
                ) : null}
                {submitAllResult ? (
                  <span
                    className={`text-sm ${
                      submitAllResult.startsWith('Error') ? 'text-red-600' : 'text-green-700 dark:text-green-400'
                    }`}
                  >
                    {submitAllResult}
                  </span>
                ) : null}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
