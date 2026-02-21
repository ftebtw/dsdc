# Sanity CMS Admin Setup

This is the technical setup for live CMS content.

## 1) Environment Variables

Add to `.env.local`:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2025-02-01
SANITY_API_READ_TOKEN=optional_read_token_if_dataset_private
SANITY_API_WRITE_TOKEN=editor_token_for_seed_or_admin_scripts
SANITY_WEBHOOK_SECRET=choose_a_long_random_secret
```

Set the same values in Vercel Production and Preview.

## 2) Start Studio

- Run `npm run dev`
- Open `http://localhost:3000/studio`

## 3) Singleton Documents

These are singleton documents with fixed IDs:

- `homePageContent`
- `pricingPageContent`
- `teamPageContent`
- `siteSettings`

The Studio structure is pinned to these IDs, duplicate actions are blocked, and global create templates are hidden.

## 4) Live Edit Mode (No Publish Step)

For the singleton page content above, Sanity `liveEdit` is enabled.

- Editing updates the published document directly.
- No draft/publish step is required for those documents.

## 5) Webhook for Revalidation

In Sanity project settings, add webhook:

- URL: `https://<your-vercel-domain>/api/revalidate`
- Method: `POST`
- Header: `Authorization: Bearer <SANITY_WEBHOOK_SECRET>`
- Trigger: Create, Update, Delete
- Filter: `_type in ["siteSettings", "homePageContent", "pricingPageContent", "teamPageContent"]`
- Drafts/versions: off

Manual test URL:

- `GET https://<your-vercel-domain>/api/revalidate?secret=<SANITY_WEBHOOK_SECRET>`

## 6) Quick Health Check

- `GET https://<your-vercel-domain>/api/cms/debug`
- `GET https://<your-vercel-domain>/api/cms/messages`

Expected:

- `source` should be `"live"`
- homepage hero values should appear in overrides after edits
