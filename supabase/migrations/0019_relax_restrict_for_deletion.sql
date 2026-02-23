-- classes.coach_id: restrict -> set null
alter table public.classes drop constraint if exists classes_coach_id_fkey;
alter table public.classes
  add constraint classes_coach_id_fkey
  foreign key (coach_id) references public.profiles(id) on delete set null;
alter table public.classes alter column coach_id drop not null;

-- attendance_records.marked_by: restrict -> set null
alter table public.attendance_records drop constraint if exists attendance_records_marked_by_fkey;
alter table public.attendance_records
  add constraint attendance_records_marked_by_fkey
  foreign key (marked_by) references public.profiles(id) on delete set null;
alter table public.attendance_records alter column marked_by drop not null;

-- student_absences.reported_by: restrict -> set null
alter table public.student_absences drop constraint if exists student_absences_reported_by_fkey;
alter table public.student_absences
  add constraint student_absences_reported_by_fkey
  foreign key (reported_by) references public.profiles(id) on delete set null;
alter table public.student_absences alter column reported_by drop not null;

-- report_cards.written_by: restrict -> set null
alter table public.report_cards drop constraint if exists report_cards_written_by_fkey;
alter table public.report_cards
  add constraint report_cards_written_by_fkey
  foreign key (written_by) references public.profiles(id) on delete set null;
alter table public.report_cards alter column written_by drop not null;

-- class_credits.issued_by: restrict -> set null
alter table public.class_credits drop constraint if exists class_credits_issued_by_fkey;
alter table public.class_credits
  add constraint class_credits_issued_by_fkey
  foreign key (issued_by) references public.profiles(id) on delete set null;
alter table public.class_credits alter column issued_by drop not null;
