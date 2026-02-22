import type { Database } from '@/lib/supabase/database.types';

export type PortalClass = Database['public']['Tables']['classes']['Row'];
export type PortalTerm = Database['public']['Tables']['terms']['Row'];
export type PortalProfile = Database['public']['Tables']['profiles']['Row'];

export type AttendanceUpsertPayload = {
  classId: string;
  studentId: string;
  sessionDate: string;
  status: Database['public']['Enums']['attendance_status'];
  cameraOn: boolean;
};

export type DashboardCard = {
  label: string;
  value: number | string;
  hint?: string;
};
