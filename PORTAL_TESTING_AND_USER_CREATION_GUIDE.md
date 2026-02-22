# Portal Testing and User Creation Guide (Non-Technical)

Use this as a copy/paste checklist for Rebecca to test live features safely.

## Current Scope

1. Built now:
   Public registration flow (`/register` -> `/register/classes` -> Stripe Checkout -> `/register/success`), full portal for Admin/Coach/TA/Student/Parent, scheduling flows, report cards, and payroll export.
2. New in latest update:
   Coach report card upload + submit, admin review queue (approve/reject), student/parent approved report card view, admin payroll page + CSV export, coach "My Hours".
3. Not built yet:
   Class credits UI and payroll export to accounting integrations (manual CSV only).

## URLs to Test

1. Live portal login: `https://dsdc.ca/portal/login`
2. Live registration: `https://dsdc.ca/register`
3. Live pricing: `https://dsdc.ca/pricing`
4. Local portal login: `http://localhost:3001/portal/login`
5. Local registration: `http://localhost:3001/register`

## Seed Test Accounts

Default seeded password is `PortalSeed123!Temp` unless env overrides changed it.

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

## Pre-Test Setup (Admin)

1. Confirm one active term exists in `Admin -> Terms` (example `Winter 2026`).
2. Confirm classes exist in active term with coach assignment and Zoom links.
3. Confirm Stripe webhook is set to:
   `https://dsdc.ca/api/webhooks/stripe`
4. Confirm email env vars in Vercel:
   `RESEND_API_KEY`, `PORTAL_FROM_EMAIL`, `PORTAL_APP_URL`.
5. Confirm Stripe test mode is enabled for payment tests.
6. Optional for report card nudge cron: set `PORTAL_REPORT_CARD_NUDGES_ENABLED=true` after Phase D deploy.

---

## Rebecca QA Checklist

### A) Public Registration Entry Points

1. Open `/pricing`.
2. Click `Enroll Now` on a group class card.
3. Confirm redirect goes to `/register`.
4. Check navbar: `Register` and `Portal Login` links are visible.
5. Check footer: `Register` and `Portal Login` links are visible.

### B) Student Registration (Minimal Form)

1. Open `/register`.
2. Select `I'm a Student`.
3. Confirm only 3 fields are shown:
   Display name, Email, Password.
4. Submit with a new test email.
5. Confirm redirect to `/register/classes`.
6. Select one or more classes and continue to payment.
7. Complete Stripe test payment (for example card `4242 4242 4242 4242`).
8. Confirm redirect to `/register/success`.
9. Confirm success page lists enrolled classes.

### C) Parent Registration

1. Open `/register`.
2. Select `I'm a Parent`.
3. Confirm only 5 fields are shown:
   Parent name, Parent email, Parent password, Student name, Student email.
4. Complete registration, class selection, and payment.
5. Confirm success page loads.
6. Log into parent portal and confirm linked student appears in selector.

### D) Enrollment Confirmation Email QA

After each successful registration payment:

1. Student receives confirmation email.
2. Parent flow also sends to parent.
3. Email includes per class:
   class name/type, coach name, schedule, Zoom link, term dates.
4. Parent copy says:
   `You've enrolled [student name]...`
5. Student copy says:
   `You've been enrolled...`
6. Email includes portal login link and contact line.

### E) Admin Login and Navigation

1. Log in as `admin@dsdc.local`.
2. Confirm admin menu includes:
   Dashboard, Terms, Classes, Report Cards, Payroll, Availability, Sub Requests, Private Sessions, Students, Coaches, Enroll, Legal Docs, Create User.
3. Open each menu page once and confirm no errors.
4. Toggle dark mode in top bar and confirm theme changes.

### E2) Admin Test Email Tools (No Data Changes)

1. As admin, open `Dashboard`.
2. Scroll to `Admin Test Tools`.
3. Enter a recipient email (or leave blank to use your admin email).
4. Click each test action once:
   - `Send Student Enrollment Email`
   - `Send Parent Enrollment Email`
   - `Send Report Card Approved Email`
   - `Send Report Card Rejected Email`
   - `Send Sub Request Email`
5. Confirm success message appears in the portal after each send.
6. Confirm inbox receives `[TEST]` email subjects.
7. Confirm no student records, enrollments, or report-card statuses changed from this test panel.

### F) Admin Report Card Review Flow

1. Go to `Admin -> Report Cards`.
2. Set filter `Queue (submitted)`.
3. Open a submitted report card.
4. Click `Open PDF` and confirm file opens.
5. Approve one report card and confirm status changes.
6. Reject one report card with notes and confirm status + notes save.
7. Return to list and confirm filters/history work.

### G) Coach Report Card Flow

1. Log in as `coach.junior@dsdc.local`.
2. Open `Coach -> Report Cards`.
3. For one enrolled student, upload PDF draft.
4. Confirm status becomes `Draft`.
5. Click `Submit for Review`.
6. Confirm status becomes `Submitted`.
7. If admin rejects, confirm reviewer notes appear and coach can re-upload + resubmit.

### H) Student and Parent Report Card Visibility

1. Log in as student and open `Student -> Report Cards`.
2. Confirm only approved report cards are visible.
3. Open one PDF via `Open PDF`.
4. Log in as linked parent and open `Parent -> Report Cards`.
5. Confirm parent sees selected linked student's approved report cards only.

### I) Payroll and Hours

1. As admin, open `Admin -> Coaches`.
2. Set hourly rate for one coach and save.
3. Open `Admin -> Payroll`.
4. Test date range filters:
   This month, Last month, This term.
5. Filter by one coach and confirm summary updates.
6. Click `Export CSV` and confirm file downloads.
7. As coach, open `Coach -> My Hours` and confirm session list + totals are visible.

### J) Existing Coach/TA Features

1. Coach `Check-in`: click `I'm Here`, refresh, confirm timestamp persists.
2. Coach `Attendance`: update one student, refresh, confirm autosave.
3. Coach `Resources`: upload, open, delete.
4. Coach `Availability`: add slot, verify list.
5. Sub/TA requests: create and accept with eligible account.
6. Private sessions: confirm pending/confirm/cancel flows still work.

### K) Existing Student Features

1. `My Classes`, `Attendance`, `Resources` load.
2. `Mark Absent` accepts upcoming date.
3. `Legal Documents` signing works.
4. `Feedback` submit works.
5. `Make-up Classes` shows alternatives or fallback.
6. `Book Private Session` request/cancel works.

### L) Existing Parent Features

1. Student selector appears and switching updates data.
2. Parent can mark selected student absent.
3. Parent legal signing works for selected student.
4. Parent notification preferences save correctly.
5. Chinese toggle in parent sidebar updates parent UI labels.

### M) Role Guard Checks

1. As coach, open `/portal/admin/dashboard` and confirm redirect.
2. As student, open `/portal/coach/dashboard` and confirm redirect.
3. As parent, open `/portal/student/classes` and confirm redirect.

### N) Visual Recovery

1. If styling looks wrong, hard refresh with `Ctrl + Shift + R`.
2. If still wrong, close and reopen tab.

---

## Admin SOP: Create Users

### Method 1 (Recommended): Portal UI

1. Log in as admin.
2. Open `Create User` (`/portal/signup`).
3. Set email, display name, role, locale, timezone.
4. For Coach/TA, select tier.
5. Invite ON:
   sends invite email.
6. Invite OFF:
   creates account with temporary password `PortalStudent123!Temp`.
7. Click `Create User`.

### Method 2 (Fallback): Supabase Dashboard

1. Open Supabase -> Authentication -> Users.
2. Create or invite user.
3. Ensure metadata role is one of:
   `admin`, `coach`, `ta`, `student`, `parent`.
4. If coach/TA profile fields are missing, recreate via portal Create User.

### After Creating a Coach

1. Open `Admin -> Classes`.
2. Assign coach in class dropdown.
3. Save class.

### After Creating Parent + Student Manually

1. Open `Admin -> Students`.
2. Click `View` for student.
3. In `Linked Parents`, choose parent and click `Link Parent`.

---

## API and Route References Used in Testing

1. Public routes:
   `/register`, `/register/classes`, `/register/success`, `/pricing`
2. Public APIs:
   `POST /api/register`, `POST /api/checkout`, `POST /api/webhooks/stripe`
3. Portal report card APIs:
   `POST /api/portal/report-cards/upload`
   `POST /api/portal/report-cards/[id]/submit`
   `POST /api/portal/report-cards/[id]/approve`
   `POST /api/portal/report-cards/[id]/reject`
   `GET /api/portal/report-cards/[id]/signed-url`
4. Portal payroll APIs:
   `GET /api/portal/payroll/summary`
   `GET /api/portal/payroll/export`
   `GET /api/portal/payroll/coach/[coachId]`
   `GET /api/portal/coach/hours`
   `PATCH /api/portal/admin/coaches/[coachId]/rate`
5. Admin test notification API:
   `POST /api/portal/admin/test-notifications`

## Acceptance Criteria

1. Registration + Stripe auto-enrollment work for student and parent flows.
2. Admin can review report cards (approve/reject with notes).
3. Coach can upload/submit report cards and revise rejected cards.
4. Student and parent can open approved report cards only.
5. Admin payroll summary and CSV export are accurate.
6. Coach `My Hours` works and aligns with payroll data.
7. Existing A/B/C/E features remain functional.
8. Role-based route protection still works.

## Defaults and Assumptions

1. Primary test target is `https://dsdc.ca`.
2. Non-invite temporary password is `PortalStudent123!Temp`.
3. Seed password default is `PortalSeed123!Temp` unless env override changed.
4. Stripe tests run in test mode.
