# v6 changes — fix transparent nav panel on iPhone

No database changes. Code only.

## What was wrong

Your header uses a background blur effect (`backdrop-blur`). iOS Safari has
a known bug where `position: fixed` elements nested inside a blurred
ancestor don't render correctly — the side panel was losing its solid
background and its correct full-screen positioning, so the page behind it
showed through.

## The fix

The panel and its dark backdrop now render through a React "portal" —
they're inserted directly into the page's `<body>` instead of inside the
header, so they're completely unaffected by the header's blur effect.
Visually nothing else changes: same hamburger button, same slide-in panel,
same links.

## Deploy

```
git add .
git commit -m "Fix transparent nav panel on iOS by rendering it via a portal"
git push
```

## Test

On your iPhone: tap the hamburger — the panel should now have a fully solid
background with no page text bleeding through, and it should cover the full
screen height properly.
