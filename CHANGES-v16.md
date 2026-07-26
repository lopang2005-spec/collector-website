# v16 — student unlock code + per-product discounts

## What this adds
A second way into the student catalog that doesn't need a school email or a
domain: a single code you control from the admin panel, with a start/expiry
window and a kill switch. Plus a Pula-off discount you can set per product,
shown only once a session is unlocked.

**Customer side**
- `/student` now has two tabs: "I have a code" (new) and "I have a school
  email" (existing, unchanged)
- Code entry starts an anonymous session (no email/password) and checks it
  against the active code, window, and on/off switch
- Unlocking doesn't stick around — it's re-checked every fresh browser
  session (see "How the session limit works" below)
- Discounted price (struck-through original + new price) shows on the shop
  grid, the product page, and the student catalog, wherever
  `discount_amount` is set and the session is unlocked
- Cart carries the discounted price through, not the original

**Admin side**
- New "Student Access" page (`/admin/student-access`): set the code, start
  date, expiry date, and a kill switch that overrides the expiry
- Recent unlock attempts log (last 25) — code entered, success/fail,
  timestamp — for spotting a leaked code
- Product form has a new "Student discount (P off)" field, optional, shown
  next to price
- Product list shows a `-P200`-style badge on discounted items

## How the session limit works
The anonymous auth session Supabase issues on unlock persists in a cookie
by default, same as a normal login — which would let "unlocked" survive a
browser restart. `StudentSessionGuard.tsx` (mounted app-wide) checks a
sessionStorage flag on every page load; if it's not there, it signs out any
lingering anonymous session, so the next server check comes back locked.

**Known limitation:** sessionStorage is per-tab. Unlocking in one tab, then
opening the site in a second tab, signs the shared session out — logging
the first tab out too. Fine for the normal one-tab case, but worth knowing.
A Postgres-backed session table would remove this edge case if it ever
becomes a real problem — bigger change, not done here.

## Security note
Hidden ("student-only") products are still enforced at the database level
via RLS + `is_verified_student()` — same mechanism the school-email flow
already used, just extended to also accept a redeemed code. Nothing about
the discoverability of student-only products changed; the code path plugs
into the existing, already-audited gate rather than adding a second one.

## Database changes — run this first
Run `supabase/migration_v9.sql` in Supabase SQL Editor **before** deploying
this code. It adds `discount_amount` to `products`, creates
`student_unlock_settings` / `code_unlocks` / `unlock_attempts`, adds the
`redeem_student_code()` function, and extends `is_verified_student()`.

**Also required:** turn on "Allow anonymous sign-ins" in Supabase
Dashboard → Authentication → Sign In / Providers. The code form fails
silently without it.

The unlock code ships inactive (`active = false`, code = `STUDENT`) — turn
it on and set a real code from `/admin/student-access` when ready.

## Files changed
- `supabase/migration_v9.sql` (new)
- `components/StudentSessionGuard.tsx` (new)
- `components/UnlockCodeForm.tsx` (new)
- `components/StudentUnlockSettings.tsx` (new)
- `components/UnlockAttemptsLog.tsx` (new)
- `app/admin/(dashboard)/student-access/page.tsx` (new)
- `app/student/page.tsx` (added code tab alongside email tab)
- `app/layout.tsx` (mounted StudentSessionGuard)
- `components/ProductCard.tsx` (discount display)
- `components/CategoryBrowser.tsx` (threads unlocked flag through)
- `components/ProductManager.tsx` (discount_amount field)
- `components/AddToCartButton.tsx` (effectivePrice prop)
- `components/AdminNavPanel.tsx` (added Student Access link)
- `app/shop/page.tsx`, `app/product/[id]/page.tsx`, `app/student/catalog/page.tsx` (discount pricing)
- `app/admin/(dashboard)/layout.tsx` (added Student Access link to desktop nav)
