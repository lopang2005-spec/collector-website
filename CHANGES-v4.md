# v4 changes — side navigation panel

No database changes this time — code only.

## What changed

The header nav (Shop, Track Order, theme picker, Cart) was cramming into
one row and overlapping on mobile. Replaced it with:

- A hamburger button (top right) — shows a small badge with your cart count
  even when the panel is closed.
- Tapping it slides in a side panel from the right with: Cart, Shop, Track
  Order, and the theme picker, all stacked and easy to tap.
- Tapping the **×**, tapping outside the panel, or tapping a link all close
  it again.

Logo and site name stay in the header bar as before.

## Files changed

- `components/NavPanel.tsx` — new, the slide-out panel itself
- `components/Header.tsx` — now just renders the logo + `<NavPanel />`
- `components/CartLink.tsx` — no longer used (left in place, harmless)

## Deploy

No SQL this time. Just:

```
git add .
git commit -m "Replace cramped header nav with slide-out side panel"
git push
```

## Test

1. Load the site on your phone — header should show logo + hamburger icon
   only, no overlapping text.
2. Tap the hamburger — panel slides in from the right.
3. Confirm Cart, Shop, Track Order, and the theme dropdown all work and
   close the panel when tapped (except the theme dropdown, which should
   stay open for you to pick).
4. Add something to cart, confirm the little badge appears on the
   hamburger button itself.
