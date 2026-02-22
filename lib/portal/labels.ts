import type { Database } from '@/lib/supabase/database.types';

type ClassType = Database['public']['Enums']['class_type'];
type ScheduleDay = Database['public']['Enums']['schedule_day'];
type AttendanceStatus = Database['public']['Enums']['attendance_status'];

export const classTypeLabel: Record<ClassType, string> = {
  novice_debate: 'Novice Debate',
  intermediate_debate: 'Intermediate Debate',
  advanced_debate: 'Advanced Debate',
  public_speaking: 'Public Speaking',
  wsc: "World Scholar's Cup",
};

export const scheduleDayLabel: Record<ScheduleDay, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};

export const attendanceStatusOptions: Array<{ value: AttendanceStatus; label: string }> = [
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'late', label: 'Late' },
  { value: 'sick', label: 'Sick' },
  { value: 'makeup', label: 'Make-up' },
];

export function formatClassSchedule(day: ScheduleDay, startTime: string, endTime: string) {
  return `${scheduleDayLabel[day]} ${startTime.slice(0, 5)}-${endTime.slice(0, 5)}`;
}
