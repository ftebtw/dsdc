"use client";

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

type LinkedStudent = {
  id: string;
  display_name: string | null;
  email: string;
};

export default function StudentSelector({
  label = 'Student',
  emptyLabel = 'No linked students',
}: {
  label?: string;
  emptyLabel?: string;
}) {
  const [students, setStudents] = useState<LinkedStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedStudentId = searchParams.get('student');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const supabase = getSupabaseBrowserClient();
      const { data: links } = await supabase
        .from('parent_student_links')
        .select('student_id')
        .order('created_at', { ascending: true });

      const studentIds = [...new Set((links ?? []).map((row: any) => row.student_id))];
      if (studentIds.length === 0) {
        if (!cancelled) {
          setStudents([]);
          setLoading(false);
        }
        return;
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id,display_name,email')
        .in('id', studentIds)
        .eq('role', 'student');

      if (cancelled) return;

      const profileMap = new Map((profiles ?? []).map((item: any) => [item.id, item]));
      const ordered = studentIds
        .map((studentId) => profileMap.get(studentId))
        .filter(Boolean) as LinkedStudent[];

      setStudents(ordered);
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const resolvedSelected = useMemo(() => {
    if (!students.length) return null;
    if (selectedStudentId && students.some((student) => student.id === selectedStudentId)) {
      return selectedStudentId;
    }
    return students[0].id;
  }, [selectedStudentId, students]);

  useEffect(() => {
    if (!resolvedSelected) return;
    if (selectedStudentId === resolvedSelected) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set('student', resolvedSelected);
    router.replace(`${pathname}?${params.toString()}`);
  }, [pathname, resolvedSelected, router, searchParams, selectedStudentId]);

  function onChange(nextStudentId: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('student', nextStudentId);
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <label className="block">
      <span className="block text-xs mb-1 uppercase tracking-wide text-charcoal/60 dark:text-navy-300">
        {label}
      </span>
      <select
        disabled={loading || students.length === 0}
        value={resolvedSelected ?? ''}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-2 py-1.5 text-sm"
      >
        {students.length === 0 ? (
          <option value="">{emptyLabel}</option>
        ) : (
          students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.display_name || student.email}
            </option>
          ))
        )}
      </select>
    </label>
  );
}
