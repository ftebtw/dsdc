"use client";

import Link from 'next/link';
import { useMemo, useState } from 'react';

type CoachOption = {
  id: string;
  display_name: string | null;
  email: string;
  hourly_rate: number | null;
};

type StudentOption = {
  id: string;
  display_name: string | null;
  email: string;
};

type AvailabilityOption = {
  id: string;
  coach_id: string;
  available_date: string;
  start_time: string;
  end_time: string;
  timezone: string;
};

type GroupOption = {
  id: string;
  name: string;
  coach_id: string;
};

type Props = {
  formAction: (formData: FormData) => void | Promise<void>;
  coaches: CoachOption[];
  students: StudentOption[];
  availability: AvailabilityOption[];
  groups: GroupOption[];
  defaultTimezone: string;
};

type AttendeeRow = {
  mode: 'existing' | 'new';
  studentId: string;
  name: string;
  email: string;
  locale: 'en' | 'zh';
  timezone: string;
  emailPassword: boolean;
};

const MAX_ADDITIONAL_ATTENDEES = 2;

function makeEmptyAttendee(defaultTimezone: string): AttendeeRow {
  return {
    mode: 'existing',
    studentId: '',
    name: '',
    email: '',
    locale: 'en',
    timezone: defaultTimezone,
    emailPassword: true,
  };
}

function serializeAttendees(rows: AttendeeRow[]) {
  return rows.map((row) => {
    if (row.mode === 'existing') {
      return { mode: 'existing', studentId: row.studentId };
    }
    return {
      mode: 'new',
      name: row.name,
      email: row.email,
      locale: row.locale,
      timezone: row.timezone,
      emailPassword: row.emailPassword,
    };
  });
}

const inputClassName =
  'w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2';
const labelClassName = 'mb-1 block text-sm font-medium text-navy-700 dark:text-navy-200';

function displayLabel(opt: { display_name: string | null; email: string }): string {
  return opt.display_name && opt.display_name.trim() ? `${opt.display_name} (${opt.email})` : opt.email;
}

function timeToMinutes(value: string): number {
  if (!/^\d{2}:\d{2}/.test(value)) return Number.NaN;
  const [h, m] = value.split(':').map((n) => Number(n));
  return h * 60 + m;
}

function formatPrice(value: number): string {
  return (Math.round(value * 100) / 100).toFixed(2);
}

export default function AdminCreatePrivateSessionForm({
  formAction,
  coaches,
  students,
  availability,
  groups,
  defaultTimezone,
}: Props) {
  const [coachId, setCoachId] = useState('');
  const [studentMode, setStudentMode] = useState<'existing' | 'new'>('existing');
  const [studentId, setStudentId] = useState('');
  const [dateMode, setDateMode] = useState<'free' | 'slot'>('free');
  const [availabilityId, setAvailabilityId] = useState('');
  const [requestedDate, setRequestedDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [timezone, setTimezone] = useState(defaultTimezone);
  const [price, setPrice] = useState('');
  const [priceTouched, setPriceTouched] = useState(false);
  const [status, setStatus] = useState<'awaiting_payment' | 'confirmed'>('awaiting_payment');
  const [zoomLink, setZoomLink] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [emailPassword, setEmailPassword] = useState(true);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentLocale, setNewStudentLocale] = useState<'en' | 'zh'>('en');
  const [newStudentTimezone, setNewStudentTimezone] = useState(defaultTimezone);
  const [attendees, setAttendees] = useState<AttendeeRow[]>([]);
  const [groupMode, setGroupMode] = useState<'none' | 'existing' | 'new'>('none');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');

  function updateAttendee(index: number, patch: Partial<AttendeeRow>) {
    setAttendees((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function addAttendee() {
    setAttendees((prev) =>
      prev.length >= MAX_ADDITIONAL_ATTENDEES ? prev : [...prev, makeEmptyAttendee(defaultTimezone)]
    );
  }

  function removeAttendee(index: number) {
    setAttendees((prev) => prev.filter((_, i) => i !== index));
  }

  const selectedCoach = useMemo(() => coaches.find((c) => c.id === coachId) || null, [coaches, coachId]);

  const coachAvailability = useMemo(
    () => availability.filter((slot) => slot.coach_id === coachId),
    [availability, coachId]
  );

  const coachGroups = useMemo(
    () => groups.filter((g) => g.coach_id === coachId),
    [groups, coachId]
  );

  const durationHours = useMemo(() => {
    const startMins = timeToMinutes(startTime);
    const endMins = timeToMinutes(endTime);
    if (!Number.isFinite(startMins) || !Number.isFinite(endMins) || endMins <= startMins) return 0;
    return (endMins - startMins) / 60;
  }, [startTime, endTime]);

  const suggestedPrice = useMemo(() => {
    if (!selectedCoach?.hourly_rate || durationHours <= 0) return null;
    return Math.round(selectedCoach.hourly_rate * durationHours * 100) / 100;
  }, [selectedCoach, durationHours]);

  function handleCoachChange(value: string) {
    setCoachId(value);
    setAvailabilityId('');
    if (!priceTouched) {
      // Try to recompute now that coach changed.
      const next = coaches.find((c) => c.id === value);
      const rate = next?.hourly_rate ?? null;
      if (rate !== null && durationHours > 0) {
        setPrice(formatPrice(rate * durationHours));
      }
    }
  }

  function handleStartTimeChange(value: string) {
    setStartTime(value);
    if (!priceTouched) {
      maybeRecomputePrice(value, endTime);
    }
  }

  function handleEndTimeChange(value: string) {
    setEndTime(value);
    if (!priceTouched) {
      maybeRecomputePrice(startTime, value);
    }
  }

  function maybeRecomputePrice(start: string, end: string) {
    const startMins = timeToMinutes(start);
    const endMins = timeToMinutes(end);
    if (!Number.isFinite(startMins) || !Number.isFinite(endMins) || endMins <= startMins) return;
    const rate = selectedCoach?.hourly_rate ?? null;
    if (rate === null) return;
    const hours = (endMins - startMins) / 60;
    setPrice(formatPrice(rate * hours));
  }

  function handleSlotChange(value: string) {
    setAvailabilityId(value);
    const slot = coachAvailability.find((s) => s.id === value);
    if (slot) {
      setRequestedDate(slot.available_date);
      setStartTime(slot.start_time.slice(0, 5));
      setEndTime(slot.end_time.slice(0, 5));
      setTimezone(slot.timezone);
      if (!priceTouched) {
        maybeRecomputePrice(slot.start_time.slice(0, 5), slot.end_time.slice(0, 5));
      }
    }
  }

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="student_mode" value={studentMode} />
      <input
        type="hidden"
        name="availability_id"
        value={dateMode === 'slot' ? availabilityId : ''}
      />
      <input type="hidden" name="attendees" value={JSON.stringify(serializeAttendees(attendees))} />
      <input type="hidden" name="group_mode" value={groupMode} />
      <input
        type="hidden"
        name="group_id"
        value={groupMode === 'existing' ? selectedGroupId : ''}
      />
      <input
        type="hidden"
        name="new_group_name"
        value={groupMode === 'new' ? newGroupName : ''}
      />
      <input
        type="hidden"
        name="new_group_description"
        value={groupMode === 'new' ? newGroupDescription : ''}
      />

      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-navy-800 dark:text-white">Coach</h3>
          <p className="text-sm text-charcoal/65 dark:text-navy-300">
            Pick the coach to attach to this session. Their hourly rate will pre-fill the price field.
          </p>
        </div>
        <label className="block">
          <span className={labelClassName}>Coach</span>
          <select
            name="coach_id"
            required
            value={coachId}
            onChange={(event) => handleCoachChange(event.target.value)}
            className={inputClassName}
          >
            <option value="">Select a coach</option>
            {coaches.map((coach) => (
              <option key={coach.id} value={coach.id}>
                {displayLabel(coach)}
                {coach.hourly_rate !== null ? ` — $${formatPrice(coach.hourly_rate)}/hr` : ' — no rate set'}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-navy-800 dark:text-white">Student</h3>
          <p className="text-sm text-charcoal/65 dark:text-navy-300">
            Pick an existing student, or create a new account inline.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setStudentMode('existing')}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              studentMode === 'existing'
                ? 'bg-navy-800 text-white'
                : 'border border-warm-300 dark:border-navy-600 text-navy-800 dark:text-navy-100'
            }`}
          >
            Pick existing
          </button>
          <button
            type="button"
            onClick={() => setStudentMode('new')}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              studentMode === 'new'
                ? 'bg-navy-800 text-white'
                : 'border border-warm-300 dark:border-navy-600 text-navy-800 dark:text-navy-100'
            }`}
          >
            Add new
          </button>
        </div>

        {studentMode === 'existing' ? (
          <label className="block">
            <span className={labelClassName}>Student</span>
            <select
              name="student_id"
              value={studentId}
              onChange={(event) => setStudentId(event.target.value)}
              className={inputClassName}
              required
            >
              <option value="">Select a student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {displayLabel(student)}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <div className="space-y-4 rounded-xl border border-warm-200 dark:border-navy-700 bg-warm-50 dark:bg-navy-900/50 p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className={labelClassName}>Full Name</span>
                <input
                  type="text"
                  name="new_student_name"
                  required={studentMode === 'new'}
                  value={newStudentName}
                  onChange={(event) => setNewStudentName(event.target.value)}
                  className={inputClassName}
                />
              </label>
              <label className="block">
                <span className={labelClassName}>Email</span>
                <input
                  type="email"
                  name="new_student_email"
                  required={studentMode === 'new'}
                  value={newStudentEmail}
                  onChange={(event) => setNewStudentEmail(event.target.value)}
                  className={inputClassName}
                />
              </label>
              <label className="block">
                <span className={labelClassName}>Locale</span>
                <select
                  name="new_student_locale"
                  value={newStudentLocale}
                  onChange={(event) => setNewStudentLocale(event.target.value as 'en' | 'zh')}
                  className={inputClassName}
                >
                  <option value="en">English</option>
                  <option value="zh">中文</option>
                </select>
              </label>
              <label className="block">
                <span className={labelClassName}>Timezone</span>
                <input
                  type="text"
                  name="new_student_timezone"
                  value={newStudentTimezone}
                  onChange={(event) => setNewStudentTimezone(event.target.value)}
                  className={inputClassName}
                />
              </label>
            </div>
            <label className="inline-flex items-center gap-2 text-sm font-medium text-navy-800 dark:text-white">
              <input
                type="checkbox"
                name="email_password"
                checked={emailPassword}
                onChange={(event) => setEmailPassword(event.target.checked)}
              />
              Email the generated temporary password to the student
            </label>
            <p className="text-xs text-charcoal/65 dark:text-navy-300">
              A random password will be generated. If unchecked, you&apos;ll need to share login credentials manually
              (you can later trigger a password reset from Supabase).
            </p>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-navy-800 dark:text-white">
            Additional Attendees ({attendees.length}/{MAX_ADDITIONAL_ATTENDEES})
          </h3>
          <p className="text-sm text-charcoal/65 dark:text-navy-300">
            Optional. Add up to {MAX_ADDITIONAL_ATTENDEES} siblings or co-attendees. The primary student above
            still handles payment and portal display; additional attendees just get attached to the session.
          </p>
        </div>

        {attendees.length === 0 ? (
          <p className="text-sm text-charcoal/65 dark:text-navy-300">
            No additional attendees. Click below to add one.
          </p>
        ) : null}

        {attendees.map((row, index) => (
          <div
            key={index}
            className="space-y-4 rounded-xl border border-warm-200 dark:border-navy-700 bg-warm-50 dark:bg-navy-900/50 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-sm font-semibold text-navy-800 dark:text-white">Attendee {index + 2}</h4>
              <button
                type="button"
                onClick={() => removeAttendee(index)}
                className="text-sm text-red-600 dark:text-red-400 hover:underline"
              >
                Remove
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => updateAttendee(index, { mode: 'existing' })}
                className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                  row.mode === 'existing'
                    ? 'bg-navy-800 text-white'
                    : 'border border-warm-300 dark:border-navy-600 text-navy-800 dark:text-navy-100'
                }`}
              >
                Pick existing
              </button>
              <button
                type="button"
                onClick={() => updateAttendee(index, { mode: 'new' })}
                className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                  row.mode === 'new'
                    ? 'bg-navy-800 text-white'
                    : 'border border-warm-300 dark:border-navy-600 text-navy-800 dark:text-navy-100'
                }`}
              >
                Add new
              </button>
            </div>

            {row.mode === 'existing' ? (
              <label className="block">
                <span className={labelClassName}>Student</span>
                <select
                  value={row.studentId}
                  onChange={(event) => updateAttendee(index, { studentId: event.target.value })}
                  className={inputClassName}
                  required
                >
                  <option value="">Select a student</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {displayLabel(student)}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <div className="space-y-3">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className={labelClassName}>Full Name</span>
                    <input
                      type="text"
                      value={row.name}
                      onChange={(event) => updateAttendee(index, { name: event.target.value })}
                      className={inputClassName}
                      required={row.mode === 'new'}
                    />
                  </label>
                  <label className="block">
                    <span className={labelClassName}>Email</span>
                    <input
                      type="email"
                      value={row.email}
                      onChange={(event) => updateAttendee(index, { email: event.target.value })}
                      className={inputClassName}
                      required={row.mode === 'new'}
                    />
                  </label>
                  <label className="block">
                    <span className={labelClassName}>Locale</span>
                    <select
                      value={row.locale}
                      onChange={(event) =>
                        updateAttendee(index, { locale: event.target.value as 'en' | 'zh' })
                      }
                      className={inputClassName}
                    >
                      <option value="en">English</option>
                      <option value="zh">中文</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className={labelClassName}>Timezone</span>
                    <input
                      type="text"
                      value={row.timezone}
                      onChange={(event) => updateAttendee(index, { timezone: event.target.value })}
                      className={inputClassName}
                    />
                  </label>
                </div>
                <label className="inline-flex items-center gap-2 text-sm font-medium text-navy-800 dark:text-white">
                  <input
                    type="checkbox"
                    checked={row.emailPassword}
                    onChange={(event) => updateAttendee(index, { emailPassword: event.target.checked })}
                  />
                  Email the generated temporary password to this student
                </label>
              </div>
            )}
          </div>
        ))}

        {attendees.length < MAX_ADDITIONAL_ATTENDEES ? (
          <button
            type="button"
            onClick={addAttendee}
            className="rounded-lg border border-dashed border-warm-300 dark:border-navy-600 px-4 py-2 text-sm font-medium text-navy-800 dark:text-navy-100 hover:bg-warm-100 dark:hover:bg-navy-700"
          >
            + Add attendee
          </button>
        ) : (
          <p className="text-xs text-charcoal/65 dark:text-navy-300">
            Max {MAX_ADDITIONAL_ATTENDEES} additional attendees reached.
          </p>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-navy-800 dark:text-white">Classroom Group</h3>
          <p className="text-sm text-charcoal/65 dark:text-navy-300">
            Optional. Attach this session to a private coaching classroom so the coach can post homework, share
            resources, and see upcoming sessions all in one place. Hidden from the regular admin classes list.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setGroupMode('none')}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              groupMode === 'none'
                ? 'bg-navy-800 text-white'
                : 'border border-warm-300 dark:border-navy-600 text-navy-800 dark:text-navy-100'
            }`}
          >
            None (standalone)
          </button>
          <button
            type="button"
            onClick={() => setGroupMode('existing')}
            disabled={!coachId}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              groupMode === 'existing'
                ? 'bg-navy-800 text-white'
                : 'border border-warm-300 dark:border-navy-600 text-navy-800 dark:text-navy-100'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={coachId ? '' : 'Select a coach first'}
          >
            Pick existing group
          </button>
          <button
            type="button"
            onClick={() => setGroupMode('new')}
            disabled={!coachId}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              groupMode === 'new'
                ? 'bg-navy-800 text-white'
                : 'border border-warm-300 dark:border-navy-600 text-navy-800 dark:text-navy-100'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={coachId ? '' : 'Select a coach first'}
          >
            Create new group
          </button>
        </div>

        {groupMode === 'existing' ? (
          <label className="block">
            <span className={labelClassName}>Classroom</span>
            <select
              value={selectedGroupId}
              onChange={(event) => setSelectedGroupId(event.target.value)}
              className={inputClassName}
              required={groupMode === 'existing'}
            >
              <option value="">Select a classroom</option>
              {coachGroups.length === 0 ? (
                <option disabled>No existing classroom groups for this coach</option>
              ) : null}
              {coachGroups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
            <span className="mt-1 block text-xs text-charcoal/65 dark:text-navy-300">
              Students from this session will be enrolled into the classroom automatically.
            </span>
          </label>
        ) : null}

        {groupMode === 'new' ? (
          <div className="space-y-3 rounded-xl border border-warm-200 dark:border-navy-700 bg-warm-50 dark:bg-navy-900/50 p-4">
            <label className="block">
              <span className={labelClassName}>Group name</span>
              <input
                type="text"
                value={newGroupName}
                onChange={(event) => setNewGroupName(event.target.value)}
                placeholder="e.g. Smith Family Coaching"
                className={inputClassName}
                required={groupMode === 'new'}
              />
            </label>
            <label className="block">
              <span className={labelClassName}>Description (optional)</span>
              <textarea
                value={newGroupDescription}
                onChange={(event) => setNewGroupDescription(event.target.value)}
                placeholder="What's this group focused on? (Shown to the coach.)"
                rows={3}
                className={`${inputClassName} min-h-[80px]`}
              />
            </label>
            <p className="text-xs text-charcoal/65 dark:text-navy-300">
              The coach will see this classroom in their portal under &ldquo;Private Coaching Groups&rdquo; with all
              the usual homework + resources tools.
            </p>
          </div>
        ) : null}
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-navy-800 dark:text-white">When</h3>
          <p className="text-sm text-charcoal/65 dark:text-navy-300">
            Pick from the coach&apos;s open availability or enter a custom date/time.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setDateMode('free')}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              dateMode === 'free'
                ? 'bg-navy-800 text-white'
                : 'border border-warm-300 dark:border-navy-600 text-navy-800 dark:text-navy-100'
            }`}
          >
            Free-form
          </button>
          <button
            type="button"
            onClick={() => setDateMode('slot')}
            disabled={!coachId}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              dateMode === 'slot'
                ? 'bg-navy-800 text-white'
                : 'border border-warm-300 dark:border-navy-600 text-navy-800 dark:text-navy-100'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={coachId ? '' : 'Select a coach first'}
          >
            From coach availability
          </button>
        </div>

        {dateMode === 'slot' ? (
          <label className="block">
            <span className={labelClassName}>Availability Slot</span>
            <select
              value={availabilityId}
              onChange={(event) => handleSlotChange(event.target.value)}
              className={inputClassName}
              required={dateMode === 'slot'}
            >
              <option value="">Select a slot</option>
              {coachAvailability.length === 0 ? (
                <option disabled>No upcoming availability for this coach</option>
              ) : null}
              {coachAvailability.map((slot) => (
                <option key={slot.id} value={slot.id}>
                  {slot.available_date} {slot.start_time.slice(0, 5)}–{slot.end_time.slice(0, 5)} ({slot.timezone})
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <div className="grid gap-4 md:grid-cols-4">
          <label className="block md:col-span-1">
            <span className={labelClassName}>Date</span>
            <input
              type="date"
              name="requested_date"
              required
              value={requestedDate}
              onChange={(event) => setRequestedDate(event.target.value)}
              className={inputClassName}
            />
          </label>
          <label className="block">
            <span className={labelClassName}>Start Time</span>
            <input
              type="time"
              name="requested_start_time"
              required
              value={startTime}
              onChange={(event) => handleStartTimeChange(event.target.value)}
              className={inputClassName}
            />
          </label>
          <label className="block">
            <span className={labelClassName}>End Time</span>
            <input
              type="time"
              name="requested_end_time"
              required
              value={endTime}
              onChange={(event) => handleEndTimeChange(event.target.value)}
              className={inputClassName}
            />
          </label>
          <label className="block">
            <span className={labelClassName}>Timezone</span>
            <input
              type="text"
              name="timezone"
              value={timezone}
              onChange={(event) => setTimezone(event.target.value)}
              className={inputClassName}
              required
            />
          </label>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-navy-800 dark:text-white">Session Details</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="block">
            <span className={labelClassName}>Price (CAD)</span>
            <input
              type="number"
              name="price_cad"
              step="0.01"
              min="0"
              required
              value={price}
              onChange={(event) => {
                setPrice(event.target.value);
                setPriceTouched(true);
              }}
              className={inputClassName}
            />
            {suggestedPrice !== null ? (
              <span className="mt-1 block text-xs text-charcoal/65 dark:text-navy-300">
                Suggested: ${formatPrice(suggestedPrice)} ({durationHours.toFixed(2)}h × $
                {formatPrice(selectedCoach?.hourly_rate || 0)}/hr)
              </span>
            ) : null}
          </label>
          <label className="block">
            <span className={labelClassName}>Status</span>
            <select
              name="status"
              value={status}
              onChange={(event) => setStatus(event.target.value as 'awaiting_payment' | 'confirmed')}
              className={inputClassName}
            >
              <option value="awaiting_payment">Awaiting payment</option>
              <option value="confirmed">Confirmed (already paid / comp)</option>
            </select>
          </label>
          <label className="block">
            <span className={labelClassName}>Zoom Link (optional)</span>
            <input
              type="url"
              name="zoom_link"
              value={zoomLink}
              onChange={(event) => setZoomLink(event.target.value)}
              placeholder="https://zoom.us/j/..."
              className={inputClassName}
            />
          </label>
        </div>
        <label className="block">
          <span className={labelClassName}>Admin Notes (optional)</span>
          <textarea
            name="admin_notes"
            rows={4}
            value={adminNotes}
            onChange={(event) => setAdminNotes(event.target.value)}
            placeholder="Saved to the session as coach_notes — visible to the coach."
            className={`${inputClassName} min-h-[100px]`}
          />
        </label>
      </section>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-navy-800 text-white font-semibold hover:bg-navy-700"
        >
          Create Session
        </button>
        <Link
          href="/portal/admin/private-sessions"
          className="px-4 py-2 rounded-lg border border-warm-300 dark:border-navy-600 text-sm font-medium text-navy-800 dark:text-navy-100 hover:bg-warm-100 dark:hover:bg-navy-700"
        >
          Cancel
        </Link>
        <p className="text-xs text-charcoal/65 dark:text-navy-300">
          After creating, you can generate a Stripe payment link from the session card (only if status is
          &ldquo;Awaiting payment&rdquo;).
        </p>
      </div>
    </form>
  );
}
