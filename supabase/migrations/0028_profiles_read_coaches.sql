-- Allow students and parents to read coach/TA profiles (for booking, calendar, etc.)
CREATE POLICY profiles_student_select_coaches ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles me WHERE me.id = auth.uid() AND me.role = 'student')
    AND EXISTS (SELECT 1 FROM coach_profiles cp WHERE cp.coach_id = profiles.id)
  );

CREATE POLICY profiles_parent_select_coaches ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles me WHERE me.id = auth.uid() AND me.role = 'parent')
    AND EXISTS (SELECT 1 FROM coach_profiles cp WHERE cp.coach_id = profiles.id)
  );
