# v5 changes — theme cleanup

No database changes. Code only.

## What changed

- **Removed** the Maroon theme entirely.
- **Renamed** "Light" to **"Baby Blue"** and gave it an actual soft
  baby-blue color palette (white surface, deep navy text, teal-blue accent)
  instead of the old off-white/gold look.

Themes are now: **Dark**, **Baby Blue**, **Light Blue**.

One thing worth knowing: your site already had a separate **"Light Blue"**
theme (a different, more muted blue). It's untouched, so you'll now have
two blue-leaning themes (Baby Blue and Light Blue) alongside Dark. If you'd
rather only have one blue theme, let me know which one to drop and I'll
remove it in the next update.

## Files changed

- `lib/theme-context.tsx` — theme list updated
- `app/globals.css` — color values updated

## Deploy

```
git add .
git commit -m "Remove maroon theme, rename light to baby blue"
git push
```

## Test

Open the theme picker (in the side panel from the last update) — should
show Dark, Baby Blue, Light Blue only, no Maroon. Selecting Baby Blue should
show the soft blue palette, not the old cream/gold "Light" look.
