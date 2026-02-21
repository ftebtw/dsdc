# Rebecca Editing Guide (Simple)

This guide is for day-to-day content updates in the CMS.

## Important: Create Documents First

**"No matching documents"** or **only Pricing shows** in "Documents on this page" usually means Homepage, Team, or Site Settings documents don't exist yet.

**Option A – Seed (recommended):** Run `npm run seed:cms` in the project folder. This creates all four documents from the built-in content. Requires `SANITY_API_WRITE_TOKEN` in `.env.local`.

**Option B – Manual:** Click **Content** → for each of **Homepage**, **Pricing Page**, **Team Page**, **Site Settings** → click it, then **Create**, then **Publish** (even if empty).

## Wix-Style Editing: Use the Preview Tab

For a **split view** (see the site while you edit):

1. Click **Preview** in the top bar (next to Content).
2. The site appears on the left. On the right, **Documents on this page** lists the editable documents (e.g. Homepage Content).
3. Click a document in that list to open the edit form, edit, then Publish.
4. If "Documents on this page" is empty: use **Content** → open the document (Homepage, Pricing, etc.) → then click **Preview**.

## Where to Edit What

The left sidebar is organized by **page**:

| Click this in Studio | What it edits on the website |
|----------------------|------------------------------|
| **Homepage**         | Main page (dsdc.ca or dsdc-nine.vercel.app) |
| **Pricing Page**     | /pricing page                |
| **Team Page**        | /team page (coaches, bios)   |
| **Site Settings**    | Nav, footer, contact info    |

## How to Edit a Page

1. **Click the page** (e.g. Homepage) in the left sidebar.
2. If you see a list, click the document (or **Create** if none exists yet).
3. You’ll see sections like **Hero**, **How It Works**, **Testimonials**, etc.
4. Each section has **English** and **Chinese** fields. Edit the one(s) you need.
5. Click **Publish** (top right).
6. Wait a few seconds, then refresh the live website to confirm the change.

## Sections on the Homepage

When you open **Homepage** and edit its content:

- **Hero** → The big headline and buttons at the top.
- **Difference Section** → The three cards (Coaching, Attention, Leadership).
- **How It Works** → The three steps (Consultation, Trial, Enroll).
- **Mission** → The mission block and CTA.
- **Classes Overview** → The Public Speaking, Debate, and WSC cards.
- **Testimonials** → Quotes from parents/students.
- **FAQ** → Questions and answers.
- **Final CTA** → The bottom “Book a consultation” section.

## Publish

- Click **Publish** (top right) after editing.
- Wait 15–30 seconds if the site doesn’t update immediately.

## If You Do Not See the Change

1. Refresh the browser once.
2. Wait 15–30 seconds and refresh again.
3. If still not updated, message the admin:  
   “I published in Sanity but the site did not refresh.”

## Safe Editing Tips

- Change one section at a time.
- Publish small updates often.
- Avoid deleting large blocks unless planned.
- If unsure, copy text into a note before editing.

## Rollback (If Needed)

1. Open the same document in the CMS.
2. Use document history/previous revision.
3. Restore the previous version.
4. Click **Publish** again.
