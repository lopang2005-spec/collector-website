# v9 — Student discount login/signup

## What this adds

- A student verification flow at `/student`: enter a school email, get a
  6-digit code, enter the code, done. No passwords, no account management.
- A hidden catalog at `/student/catalog`, only reachable by verified
  students — enforced by the database itself (Postgres RLS), not just by
  hiding a link in the UI.
- `/admin/schools`: manage the list of school email domains that count as
  "verified" (e.g. `biust.ac.bw`). Toggle a school on/off any time — you'll
  likely want everything off outside term time.
- A "Student-only item" checkbox on each product in `/admin/products`.
  Checked = only shows in the student catalog. Unchecked (default) = shows
  in the normal shop like always.

## The security fix that came with it (important — read this)

Before this update, every admin policy in Supabase ("who can add/edit/
delete products, settings, orders") was written as "anyone who is logged
in." That was safe only because you were the only person who could ever
log in. Adding student sign-in means verified students now log in too —
so if this had been left as-is, a verified student could have edited your
products or changed your WhatsApp number.

`migration_v4.sql` fixes this by introducing a real `admins` table and an
`is_admin()` check, and rewrites every admin policy (products, settings,
orders, storage) to require it specifically. `middleware.ts` was updated
the same way — it used to just check "is someone logged in," now it checks
"is this person actually the admin" before letting them into `/admin`.

## Setup steps (do these in order)

1. In Supabase → SQL Editor, run `migration_v4.sql`.
2. **Before running it**, edit this line near the top to use your actual
   admin login email:
   ```sql
   insert into admins (email) values ('YOUR-ADMIN-EMAIL@example.com')
   ```
3. In Supabase → Authentication → Email Templates → "Magic Link", make sure
   the template includes `{{ .Token }}` somewhere in the body — that's what
   lets students receive a 6-digit code instead of only a clickable link.
   The Supabase default template already includes this; only change it if
   you've customized it before.
4. Deploy as usual. Then go to `/admin/schools` and add each school (e.g.
   school name "BIUST", domain `biust.ac.bw`).
5. Test the whole thing yourself with your own school email before telling
   any real students about it.

## Known limitation, on purpose

A verified student's session stays logged in on their phone for a few
weeks. If they hand their unlocked phone to a friend, the friend can browse
the student catalog. This is the same tradeoff Spotify Student and Apple
Music Student both accept — no verification method fully closes it, and
it's a social trust problem more than a technical one. Not fixed here;
flagging so it's a known, deliberate gap rather than a surprise later.
