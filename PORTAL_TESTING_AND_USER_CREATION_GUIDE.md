# Portal Testing + User Creation Guide (Non-Technical)

This is a copy/paste checklist you can give Rebecca to test all current portal features (Phase A + Phase B), plus exact steps for creating users and linking parents/students.

## Current Scope

1. Built now:
   Admin portal, Coach/TA portal, Student portal core, Parent portal core, plus Phase C scheduling/substitute/private-session flows.
2. Still placeholder pages:
   Student report cards, Parent report cards.

## Portal Login URLs

1. Live: `https://dsdc-nine.vercel.app/portal/login`
2. Local (if needed): `http://localhost:3001/portal/login`

## Test Accounts (Seeded)

All seeded accounts use password: `PortalSeed123!Temp` (unless changed by env override).

1. Admin: `admin@dsdc.local`
2. Coach: `coach.junior@dsdc.local`
3. Coach: `coach.senior@dsdc.local`
4. Coach: `coach.wsc@dsdc.local`
5. TA: `ta.assistant@dsdc.local`
6. Student: `student.1@dsdc.local`
7. Student: `student.2@dsdc.local`
8. Student: `student.3@dsdc.local`
9. Parent: `parent.1@dsdc.local`
10. Parent: `parent.2@dsdc.local`

---

## Rebecca QA Checklist (Step-by-Step)

### A) Admin Login + Navigation

1. Open `https://dsdc-nine.vercel.app/portal/login`.
2. Log in with `admin@dsdc.local`.
3. Confirm left menu shows:
   Dashboard, Terms, Classes, Availability, Sub Requests, Private Sessions, Students, Coaches, Enroll, Legal Docs, Create User.
4. Click each menu item and confirm pages open with no errors.

### B) Admin Core Features

1. Open `Terms`.
2. Confirm `Winter 2026` exists and is active.
3. Open `Classes`.
4. Edit one class name by adding `TEST`, click `Save`, refresh, confirm it stayed.
5. Revert class name and save again.
6. Open `Students`.
7. Click `View` for one student and confirm detail page loads.
8. Open `Coaches`.
9. Confirm coach list and recent check-ins load.
10. Open `Enroll`.
11. Enroll one existing student into one class and confirm success message.

### C) Admin Parent-Student Link Test

1. Open `Students` -> click `View` on a student.
2. In `Linked Parents`, choose a parent and click `Link Parent`.
3. Confirm parent appears in linked list.
4. Click `Unlink`.
5. Confirm parent is removed.

### D) Admin Legal Docs Test

1. Open `Legal Docs`.
2. Upload a small PDF/template:
   set title, required_for, optional description, then upload file.
3. Confirm document appears in list.
4. Click `Open Document` to verify file opens.
5. Expand `View signature details` and confirm signed/unsigned sections render.

### E) Create New User (Admin)

1. Open `Create User` (`/portal/signup`).
2. Create a test coach:
   Email `test.coach+1@yourdomain.com`,
   Role `Coach`,
   Tier `junior`.
3. Keep `Send invite email` checked and submit.
4. Confirm `User invited successfully.`
5. If invite email does not arrive, try again with invite unchecked.
6. For non-invite users, temporary password is `PortalStudent123!Temp`.

### F) Coach/TA Features

1. Log out.
2. Log in as `coach.junior@dsdc.local`.
3. Open `Check-in`.
4. Click `I'm Here` for today's class.
5. Refresh and confirm checked-in time still shows.
6. Open `My Classes`.
7. Confirm assigned classes and student names appear.
8. Open attendance from one class.
9. Change one student status (for example `Present -> Late`), wait 1 second, refresh, confirm it saved.
10. Open class resources page.
11. Upload one small file, click `Open`, then click `Delete`.
12. Open `Availability`, create one slot, refresh, confirm it persists.
13. Create one `Sub Request` and one `TA Request`.
14. If using TA account, open available TA requests and accept one.
15. Open `Private Sessions` and confirm pending requests are visible for assigned coach.

If there are no classes scheduled for today, seeing `No classes scheduled for today.` is normal.

### G) Student Features

1. Log out.
2. Log in as `student.1@dsdc.local`.
3. Confirm student menu shows:
   My Classes, Attendance, Resources, Book Private Session, Report Cards, Legal Documents, Mark Absent, Feedback, Make-up Classes.
4. Open `My Classes` and confirm classes load.
5. Open `Attendance` and confirm rows/summary load.
6. Open `Resources` and test opening one resource (if available).
7. Open `Mark Absent`, submit one upcoming absence, confirm it appears in list.
8. Open `Legal Documents`:
   if doc exists, open document and sign once.
9. Open `Feedback`, submit test message, confirm thank-you message.
10. Open `Make-up Classes`, confirm info appears (or a fallback message if no absence scenario exists).
11. Open `Book Private Session`, select a slot, submit request, confirm it appears in My Bookings.
12. Cancel a pending private request and confirm status updates.
13. Open `Report Cards` and confirm it still shows coming soon text.

### H) Parent Features

1. Log out.
2. Log in as `parent.1@dsdc.local`.
3. Confirm parent menu shows:
   Dashboard, My Student's Classes, Attendance, Resources, Report Cards, Legal Documents, Mark Absent, Private Sessions, Notification Preferences.
4. Confirm Student selector appears in sidebar and can switch linked students.
5. Open `Dashboard`, `Classes`, `Attendance`, `Resources` and confirm data changes when switching student.
6. Open `Mark Absent`, submit one upcoming absence, confirm it appears in list.
7. Open `Legal Documents`:
   if a doc is unsigned, sign it; if already signed, confirm signed status and view signature works.
8. Open `Notification Preferences`, change options, click save, refresh, confirm saved values persist.
9. Change parent language to Chinese using sidebar language selector and confirm parent page labels update.
10. Open `Private Sessions` and confirm it shows selected student's private session history (read-only).

### I) Admin Phase C Features

1. Open `Availability` and confirm coach slots are visible with filter controls.
2. Open `Sub Requests` and confirm both Sub and TA requests appear.
3. Cancel one open request from admin page and verify status updates.
4. Open `Private Sessions` and confirm pending/confirmed/cancelled/completed rows appear.
5. Confirm one pending session and verify status changes.
6. Mark one confirmed session as completed.

### J) Permission Guard Test

1. While logged in as coach, try opening `/portal/admin/dashboard`.
2. Confirm redirect away from admin routes.
3. While logged in as student, try opening `/portal/coach/dashboard`.
4. Confirm redirect away from coach routes.
5. While logged in as parent, try opening `/portal/student/classes`.
6. Confirm redirect away from student routes.

### K) Optional Visual Check

1. If page appears unstyled, press `Ctrl + Shift + R` once.
2. If still unstyled, close tab and reopen URL.

---

## How to Create New Admins/Coaches/Students/Parents (SOP)

### Method 1 (Recommended): Inside Portal UI

1. Log in as admin.
2. Go to `Create User` (`/portal/signup`).
3. Fill:
   email, display name, role, locale, timezone, optional phone.
4. If role is Coach or TA, also choose tier.
5. Choose invite mode:
   Invite ON sends email invite.
   Invite OFF creates immediately with password `PortalStudent123!Temp`.
6. Click `Create User`.

### Method 2 (Fallback): Supabase Dashboard

1. Go to Supabase -> Authentication -> Users.
2. Create or invite the user.
3. Ensure metadata role is correct (`admin`, `coach`, `ta`, `student`, `parent`).
4. If coach/TA profile is missing, use portal `Create User` flow to recreate correctly.

### After Creating a Coach

1. Go to `Admin -> Classes`.
2. Assign coach in class coach dropdown.
3. Save class.

### After Creating a Parent and Student

1. Go to `Admin -> Students`.
2. Open student detail (`View`).
3. In `Linked Parents`, select parent and click `Link Parent`.
4. Parent can now switch to that student in parent portal.

---

## Public Interfaces Used by This Flow

1. UI routes:
   `/portal/signup`,
   `/portal/admin/enroll`,
   `/portal/admin/students/[studentId]`,
   `/portal/admin/legal`
2. API routes:
   `POST /api/portal/admin/create-user`
   `POST /api/portal/admin/manual-enroll`
   `POST /api/portal/absences`
   `POST /api/portal/feedback`
   `POST /api/portal/legal/sign`

## Acceptance Criteria

1. Admin can access all admin routes and create users.
2. Coach/TA can check in, mark attendance, and manage resources.
3. Student can view classes/attendance/resources, mark absence, sign legal docs, and submit feedback.
4. Parent can switch linked students, view student data, mark absences, sign legal docs, and save preferences.
5. Parent/student/coach role guards block unauthorized sections.
6. Legal docs/signature links open correctly via signed URLs.

## Assumptions and Defaults

1. Testing target is `https://dsdc-nine.vercel.app`.
2. Default non-invite password is `PortalStudent123!Temp`.
3. Seed password default is `PortalSeed123!Temp` unless overridden.
4. Placeholder pages are expected for report cards and private booking.
