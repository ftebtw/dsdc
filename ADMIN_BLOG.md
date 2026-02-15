# Blog Admin Dashboard

The blog editor lives at **`/admin/blog`**.

## Features

- **List all posts** – See all blog articles and open any for editing.
- **New post** – Click "New Post" to add a new article (slug, title, excerpt, date, author, category, read time, and sections).
- **Edit post** – Click the pencil icon on a post to edit its fields and sections (paragraph, heading, subheading, list).
- **Delete post** – Click the trash icon to remove a post from the list (save to apply).
- **Save to file** – Writes all posts to `content/blog-posts.json`. The live blog uses this file when it exists; otherwise it uses the default posts in code.
- **Export JSON** – Download `blog-posts.json` so you can add it to the repo (e.g. when hosting doesn’t allow file writes, e.g. Vercel).

## Optional: Password protection

To require a password for the admin dashboard and for saving:

1. Create a `.env.local` in the project root.
2. Add:
   ```env
   ADMIN_PASSWORD=your-secret-password
   ```
3. Restart the dev server. Visiting `/admin/blog` will show a login form; use the same password when saving.

If `ADMIN_PASSWORD` is not set, the dashboard and save are open (suitable for local use only).

## Production (e.g. Vercel)

On serverless hosts, the app often cannot write to the repo filesystem. After editing in the dashboard:

1. Click **Export JSON** to download `blog-posts.json`.
2. Put it in the `content/` folder as `content/blog-posts.json`.
3. Commit and push. The next deploy will use the updated posts.
