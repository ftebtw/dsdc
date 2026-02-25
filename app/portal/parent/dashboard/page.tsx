export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import ParentInviteCodePanel from '@/app/portal/_components/ParentInviteCodePanel';
import SectionCard from '@/app/portal/_components/SectionCard';
import { requireRole } from '@/lib/portal/auth';
import { getActiveTerm } from '@/lib/portal/data';
import { getParentSelection } from '@/lib/portal/parent';
import { parentT } from '@/lib/portal/parent-i18n';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export default async function ParentDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ student?: string }>;
}) {
  const session = await requireRole(['parent']);
  const params = await searchParams;
  const supabase = await getSupabaseServerClient();
  const locale = session.profile.locale === 'zh' ? 'zh' : 'en';

  const [parentSelection, { data: inviteCodesData }] = await Promise.all([
    getParentSelection(supabase, session.userId, params.student),
    supabase
      .from('invite_codes')
      .select('id,code,expires_at,claimed_at,claimed_by,created_at')
      .eq('parent_id', session.userId)
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  const { linkedStudents, selectedStudentId, selectedStudent } = parentSelection;
  const inviteCodes = (inviteCodesData ?? []) as Array<{
    id: string;
    code: string;
    expires_at: string;
    claimed_at: string | null;
    claimed_by: string | null;
    created_at: string;
  }>;

  if (!linkedStudents.length) {
    return (
      <div className="space-y-6">
        <SectionCard
          title={parentT(locale, 'portal.parent.dashboard.title', 'Parent Dashboard')}
          description={parentT(locale, 'portal.parent.common.noLinkedStudentsShort', 'No linked students yet.')}
        >
          <p className="text-sm text-charcoal/70 dark:text-navy-300">
            {parentT(
              locale,
              'portal.parent.common.noLinkedStudents',
              'Ask admin to link your parent account from the student detail page.'
            )}
          </p>
        </SectionCard>

        <SectionCard
          title={parentT(locale, 'portal.parent.linkStudent.title', 'Link Student')}
          description={parentT(
            locale,
            'portal.parent.linkStudent.description',
            'Generate invite codes to let students link to your parent account.'
          )}
        >
          <ParentInviteCodePanel initialCodes={inviteCodes} />
        </SectionCard>
      </div>
    );
  }

  if (!selectedStudentId || params.student !== selectedStudentId) {
    redirect(`/portal/parent/dashboard?student=${selectedStudentId}`);
  }

  const [activeTerm, { data: enrollmentRowsData }] = await Promise.all([
    getActiveTerm(supabase),
    supabase
      .from('enrollments')
      .select('class_id,status')
      .eq('student_id', selectedStudentId)
      .eq('status', 'active'),
  ]);

  const enrollmentRows = (enrollmentRowsData ?? []) as Array<Record<string, any>>;

  const classIds = enrollmentRows.map((row: any) => row.class_id);
  const [{ data: activeClassesData }, { data: attendanceRowsData }] =
    classIds.length && activeTerm
      ? await Promise.all([
          supabase
            .from('classes')
            .select('id,name,term_id')
            .in('id', classIds)
            .eq('term_id', activeTerm.id),
          supabase
            .from('attendance_records')
            .select('status')
            .eq('student_id', selectedStudentId)
            .in('class_id', classIds),
        ])
      : [{ data: [] }, { data: [] }];

  const activeClasses = (activeClassesData ?? []) as Array<Record<string, any>>;
  const attendanceRows = (attendanceRowsData ?? []) as Array<Record<string, any>>;

  const absentCount = attendanceRows.filter((row: any) => row.status === 'absent').length;
  const presentCount = attendanceRows.filter((row: any) => row.status === 'present').length;
  return (
    <div className="space-y-6">
      <SectionCard
        title={parentT(locale, 'portal.parent.dashboard.title', 'Parent Dashboard')}
        description={`${parentT(locale, 'portal.parent.selectedStudent', 'Selected student')}: ${
          selectedStudent?.display_name || selectedStudent?.email || selectedStudentId
        }`}
      >
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="rounded-lg border border-warm-200 dark:border-navy-600/70 bg-warm-50 dark:bg-navy-900/65 p-3 shadow-sm dark:shadow-black/20">
            <p className="text-xs uppercase tracking-wide text-charcoal/60 dark:text-navy-200/80">
              {parentT(locale, 'portal.parent.dashboard.activeClasses', 'Active classes')}
            </p>
            <p className="text-2xl font-bold text-navy-800 dark:text-white">{activeClasses.length}</p>
          </div>
          <div className="rounded-lg border border-warm-200 dark:border-navy-600/70 bg-warm-50 dark:bg-navy-900/65 p-3 shadow-sm dark:shadow-black/20">
            <p className="text-xs uppercase tracking-wide text-charcoal/60 dark:text-navy-200/80">
              {parentT(locale, 'portal.parent.dashboard.presentCount', 'Present sessions')}
            </p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-400">{presentCount}</p>
          </div>
          <div className="rounded-lg border border-warm-200 dark:border-navy-600/70 bg-warm-50 dark:bg-navy-900/65 p-3 shadow-sm dark:shadow-black/20">
            <p className="text-xs uppercase tracking-wide text-charcoal/60 dark:text-navy-200/80">
              {parentT(locale, 'portal.parent.dashboard.absentCount', 'Absent sessions')}
            </p>
            <p className="text-2xl font-bold text-red-700 dark:text-red-400">{absentCount}</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title={parentT(locale, 'portal.parent.linkStudent.title', 'Link Student')}
        description={parentT(
          locale,
          'portal.parent.linkStudent.description',
          'Generate invite codes to let students link to your parent account.'
        )}
      >
        <ParentInviteCodePanel initialCodes={inviteCodes} />
      </SectionCard>
    </div>
  );
}
