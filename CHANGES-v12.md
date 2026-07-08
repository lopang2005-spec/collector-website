# v12 — fixed add-to-cart squish, removed redundant footer line, customizable social links

## What this fixes/changes

**1. "Available By Order" badge squishing into the "Add to cart" button**
On products with no color/size variants (like accessories), the badge and
button were both inline-level elements with nothing forcing a line break
between them — so on narrow screens they could visually run together.
Fixed by making both elements block-level, and the button full-width on
mobile.

**2. Removed the redundant "The Collector — @connoisseur.bw" footer line**
The Instagram icon at the top of the footer already links to your profile;
this text line duplicated it. Gone now — footer is just the icons,
WhatsApp button, and copyright line.

**3. Instagram/TikTok links are now editable from the admin panel**
Previously hardcoded in `Footer.tsx`. Now stored in the `settings` table
and editable at `/admin/settings` under a new "Social links" section.

## Before you deploy

Run `supabase/migration_v7.sql` in Supabase (SQL Editor) **before** pushing
this code — it adds the `instagram_url` and `tiktok_url` columns the new
code expects. Skipping this step will break settings/footer loading.
