# v15 — suggestion box

## What this adds

Customers can now send you a message (with an optional photo) straight from
the site. You read them in the admin panel.

**Customer side**
- New "Suggestions" link in the sidebar menu → `/suggestions`
- Form: message (required), name/WhatsApp (optional, nudged not forced),
  photo (optional)
- Image validated client-side: must be an image file, max 5MB
- Basic spam guard: one submission per device every 2 minutes
  (localStorage-based — not bulletproof, but stops casual spam-clicking)

**Admin side**
- New "Suggestions" tab in the admin nav (desktop bar + mobile side panel)
- Inbox list with unread indicator + count, sorted newest first
- Tap a message to read it and mark it read
- Photos are shown via signed URLs (1hr expiry) — the storage bucket is
  **not public**, so suggestion photos can't be browsed or guessed by URL
- Delete removes the row and the stored image

## What this doesn't do yet (flagging, not blocking)
- **No reply mechanism.** If a customer leaves a WhatsApp number, you still
  have to message them manually — nothing auto-replies.
- **No notifications.** You have to check `/admin/suggestions` yourself;
  nothing pings you when a message arrives. If this becomes a page you
  forget to check, worth adding an email or WhatsApp webhook on insert later.
- **Rate limiting is client-side only** (localStorage), so it stops casual
  spam but not someone deliberately clearing their storage or using
  incognito. Fine for now given your traffic; revisit if abuse shows up.

## Database changes — run this first
Run `supabase/migration_v8.sql` in Supabase SQL Editor **before** deploying
this code. It creates the `suggestions` table and the private
`suggestion-images` storage bucket with RLS policies (public can insert
only; only signed-in admins can read/update/delete).

## Files changed
- `supabase/migration_v8.sql` (new)
- `components/SuggestionForm.tsx` (new)
- `components/SuggestionInbox.tsx` (new)
- `app/suggestions/page.tsx` (new)
- `app/admin/(dashboard)/suggestions/page.tsx` (new)
- `components/NavPanel.tsx` (added Suggestions link)
- `components/AdminNavPanel.tsx` (added Suggestions link)
- `app/admin/(dashboard)/layout.tsx` (added Suggestions link)
