# v14 — admin nav no longer wraps on mobile

## What this fixes

**Admin top nav mashed together / wrapping on phone screens**
The admin header (Products, Categories, Orders, Schools, Branding, Sign out)
was a single horizontal row with no wrap handling, so on mobile it overlapped
and ran off-screen.

Added `components/AdminNavPanel.tsx` — a hamburger button that opens a
slide-in side panel, same pattern as the customer-facing `NavPanel.tsx`.

- On mobile (`< md`): header shows just the logo + hamburger icon. Tapping it
  opens the side panel with all admin links and Sign out.
- On desktop (`≥ md`): unchanged — full horizontal nav, no hamburger.
- Active page is highlighted in the side panel.
- Panel auto-closes on navigation.

## Files changed
- `components/AdminNavPanel.tsx` (new)
- `app/admin/(dashboard)/layout.tsx`
