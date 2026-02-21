# Sanity CMS Admin Setup

This doc is for technical setup of Phase 2 (Sanity + live publish).

## 1) Environment Variables

Create/update `.env.local`:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2025-02-01
SANITY_API_READ_TOKEN=optional_read_token_if_dataset_private
SANITY_WEBHOOK_SECRET=choose_a_long_random_secret
```

In Vercel, add the same vars for Production and Preview.

## 2) Start Studio

- Run `npm run dev`
- Open `http://localhost:3000/studio` (or the current dev port)
- Log in with your Sanity account

## 2b) Preview Tab (Wix-Style Editing)

- Click **Preview** in the top bar for a split view: edit form on the left, live site on the right
- The preview shows draft content before you publish
- Optional: set `SANITY_STUDIO_PREVIEW_ORIGIN` in production if the preview needs a different origin

## 3) Create Singletons

In Studio, create one document each:

- `Site Settings`
- `Homepage Content`
- `Pricing Page Content`
- `Team Page Content`

Leave any field blank to use codebase fallback content from local JSON.

## 4) Webhook for Live Revalidation

In Sanity project settings, create a webhook:

- **URL:** `https://<your-vercel-domain>/api/revalidate`
- **Method:** `POST`
- **Header:** `Authorization: Bearer <SANITY_WEBHOOK_SECRET>`
- **Trigger:** publish/unpublish on relevant document types

## 5) Non-Sticky Fallback Behavior

If Sanity is temporarily unavailable:

- app serves local JSON fallback content
- fallback responses are `no-store` (not long-lived cached)
- after Sanity recovers, webhook revalidation clears CMS cache tags/paths so live content resumes quickly

## 6) Paths Revalidated

`/`, `/pricing`, `/team`, `/classes`, `/awards`, `/blog`, `/book` plus tag `cms-content`.
