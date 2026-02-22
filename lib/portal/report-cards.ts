import 'server-only';
import type { Database } from '@/lib/supabase/database.types';

export type ReportCardStatus = Database['public']['Enums']['report_card_status'];
export type ReportCardRow = Database['public']['Tables']['report_cards']['Row'];

export const REPORT_CARD_MAX_FILE_BYTES = 10 * 1024 * 1024;

const canSubmitFrom = new Set<ReportCardStatus>(['draft', 'rejected']);
const canReviewFrom = new Set<ReportCardStatus>(['submitted']);

export function canSubmitReportCard(status: ReportCardStatus): boolean {
  return canSubmitFrom.has(status);
}

export function canReviewReportCard(status: ReportCardStatus): boolean {
  return canReviewFrom.has(status);
}

export function getReportCardLastActivityIso(row: Pick<ReportCardRow, 'status' | 'created_at' | 'reviewed_at'>): string {
  if ((row.status === 'approved' || row.status === 'rejected') && row.reviewed_at) {
    return row.reviewed_at;
  }
  return row.created_at;
}

export function isPdfFile(file: File): boolean {
  const lowerName = file.name.toLowerCase();
  return file.type === 'application/pdf' || lowerName.endsWith('.pdf');
}

export function buildReportCardStoragePath(input: {
  termId: string;
  classId: string;
  studentId: string;
  reportCardId: string;
}): string {
  return `term/${input.termId}/class/${input.classId}/student/${input.studentId}/${input.reportCardId}.pdf`;
}

export function readGeneralUpdatesPreference(value: unknown): boolean {
  if (!value || typeof value !== 'object') return true;
  const raw = (value as Record<string, unknown>).general_updates;
  if (typeof raw !== 'boolean') return true;
  return raw;
}
