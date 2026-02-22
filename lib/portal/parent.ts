import 'server-only';

type Client = any;

export type LinkedStudent = {
  id: string;
  display_name: string | null;
  email: string;
  timezone: string;
  locale: 'en' | 'zh';
};

export async function getLinkedStudentsForParent(
  supabase: Client,
  parentId: string
): Promise<LinkedStudent[]> {
  const { data: links } = await supabase
    .from('parent_student_links')
    .select('student_id')
    .eq('parent_id', parentId)
    .order('created_at', { ascending: true });

  const studentIds = [...new Set((links ?? []).map((row: any) => row.student_id))];
  if (studentIds.length === 0) return [];

  const { data: students } = await supabase
    .from('profiles')
    .select('id,display_name,email,timezone,locale')
    .in('id', studentIds)
    .eq('role', 'student');

  const map = new Map((students ?? []).map((student: any) => [student.id, student]));
  return studentIds
    .map((studentId) => map.get(studentId))
    .filter(Boolean) as LinkedStudent[];
}

export function resolveSelectedStudentId(
  linkedStudents: LinkedStudent[],
  requestedStudentId?: string | null
): string | null {
  if (linkedStudents.length === 0) return null;
  if (requestedStudentId && linkedStudents.some((student) => student.id === requestedStudentId)) {
    return requestedStudentId;
  }
  return linkedStudents[0].id;
}

export async function getParentSelection(
  supabase: Client,
  parentId: string,
  requestedStudentId?: string | null
) {
  const linkedStudents = await getLinkedStudentsForParent(supabase, parentId);
  const selectedStudentId = resolveSelectedStudentId(linkedStudents, requestedStudentId);
  const selectedStudent =
    linkedStudents.find((student) => student.id === selectedStudentId) ?? null;

  return {
    linkedStudents,
    selectedStudentId,
    selectedStudent,
  };
}
