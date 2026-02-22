import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireApiRole } from '@/lib/portal/auth';
import { getSupabaseRouteClient } from '@/lib/supabase/route';
import {
  buildReportCardStoragePath,
  isPdfFile,
  REPORT_CARD_MAX_FILE_BYTES,
} from '@/lib/portal/report-cards';
import type { Database } from '@/lib/supabase/database.types';

const bodySchema = z.object({
  studentId: z.string().uuid(),
  classId: z.string().uuid(),
  termId: z.string().uuid(),
});

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  const session = await requireApiRole(request, ['admin', 'coach', 'ta']);
  if (!session) return jsonError('Unauthorized', 401);

  const formData = await request.formData();
  const parsed = bodySchema.safeParse({
    studentId: formData.get('studentId'),
    classId: formData.get('classId'),
    termId: formData.get('termId'),
  });

  if (!parsed.success) return jsonError('Invalid payload.');

  const fileValue = formData.get('file');
  const file = fileValue instanceof File ? fileValue : null;
  if (!file || file.size === 0) return jsonError('PDF file is required.');
  if (file.size > REPORT_CARD_MAX_FILE_BYTES) {
    return jsonError('File is too large. Maximum size is 10MB.');
  }
  if (!isPdfFile(file)) return jsonError('Only PDF files are allowed.');

  const response = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, response);

  const { data: classRow, error: classError } = await supabase
    .from('classes')
    .select('id,coach_id,term_id')
    .eq('id', parsed.data.classId)
    .maybeSingle();
  if (classError) return jsonError(classError.message, 400);
  if (!classRow) return jsonError('Class not found.', 404);
  if (classRow.term_id !== parsed.data.termId) {
    return jsonError('Class is not in the specified term.', 400);
  }

  if (session.profile.role !== 'admin' && classRow.coach_id !== session.userId) {
    return jsonError('Not allowed for this class.', 403);
  }

  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('id')
    .eq('class_id', parsed.data.classId)
    .eq('student_id', parsed.data.studentId)
    .in('status', ['active', 'completed'])
    .maybeSingle();
  if (!enrollment) return jsonError('Student is not enrolled in this class.', 400);

  const { data: existingCard, error: existingError } = await supabase
    .from('report_cards')
    .select('*')
    .eq('student_id', parsed.data.studentId)
    .eq('class_id', parsed.data.classId)
    .eq('term_id', parsed.data.termId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (existingError) return jsonError(existingError.message, 400);

  if (existingCard && (existingCard.status === 'submitted' || existingCard.status === 'approved')) {
    return jsonError('Cannot replace report card while status is submitted or approved.', 409);
  }

  const reportCardId = existingCard?.id || randomUUID();
  const filePath = buildReportCardStoragePath({
    termId: parsed.data.termId,
    classId: parsed.data.classId,
    studentId: parsed.data.studentId,
    reportCardId,
  });
  const bucket = process.env.PORTAL_BUCKET_REPORT_CARDS || 'portal-report-cards';

  const upload = await supabase.storage
    .from(bucket)
    .upload(filePath, await file.arrayBuffer(), { contentType: 'application/pdf', upsert: true });
  if (upload.error) return jsonError(upload.error.message, 400);

  const rowPayload: Database['public']['Tables']['report_cards']['Insert'] = {
    id: reportCardId,
    student_id: parsed.data.studentId,
    class_id: parsed.data.classId,
    term_id: parsed.data.termId,
    written_by: existingCard?.written_by || session.userId,
    file_path: filePath,
    status: 'draft',
    reviewer_notes: null,
    reviewed_by: null,
    reviewed_at: null,
  };

  const { data: card, error: upsertError } = await supabase
    .from('report_cards')
    .upsert(rowPayload, { onConflict: 'id' })
    .select('*')
    .single();

  if (upsertError) return jsonError(upsertError.message, 400);
  return NextResponse.json({ reportCard: card });
}
