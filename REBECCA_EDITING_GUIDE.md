# Rebecca Editing Guide (Very Simple)

This CMS is now set to **live edit** for the main website content.

- You do **not** need to click Publish for these pages:
- Homepage
- Pricing Page
- Team Page
- Site Settings

Changes save to live automatically.

## Fast Start (3 Steps)

1. Open Studio: `https://dsdc-nine.vercel.app/studio`
2. Click **Content** and choose the page you want:
- Homepage
- Pricing Page
- Team Page
- Site Settings
3. Edit text and wait 10 to 30 seconds, then refresh the website.

## What Each Section Controls

- **Homepage**: hero text, cards, testimonials, FAQ, final call-to-action.
- **Pricing Page**: pricing text, currency labels, private coaching copy.
- **Team Page**: team labels and coach bios.
- **Site Settings**: navigation labels and footer/contact text.

## How To Confirm A Change Worked

1. Refresh the page on `https://dsdc-nine.vercel.app/` (or the page you edited).
2. Hard refresh if needed:
- Windows: `Ctrl+Shift+R`
- Mac: `Cmd+Shift+R`
3. Wait up to 30 seconds and refresh once more.

## If You Still Do Not See The New Text

1. Check this URL: `https://dsdc-nine.vercel.app/api/cms/debug`
2. Confirm:
- `"source":"live"`
- `heroHeadlineFromCms` is not `"(none)"` (for homepage hero edits)
3. If it still does not match, send the admin:
- the exact text you changed
- which page you changed
- a screenshot of the debug URL response

## Important Safety Notes

- Changes are live-edit, so edits affect the live site.
- Make small edits and check the site after each one.
- Keep a copy of old text before large rewrites.
