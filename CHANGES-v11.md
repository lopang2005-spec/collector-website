# v11 — real hero section, shop-by-category, search, cleaner WhatsApp footer

## What this adds

**1. A real hero section**
The homepage was just a "New In" heading — no hero, no imagery. There's
now a full-bleed banner up top with your location tag, headline, subtitle,
a "Shop New Arrivals" button (jumps straight to the product grid), and a
row of trust badges (Verified pieces / Gaborone & nationwide / Order via
WhatsApp). You can optionally upload a background photo for it at
`/admin/settings` — leave it empty and it falls back to a clean dark field
with a subtle grid pattern, still on-brand.

**2. Shop by category instead of one long page**
Before, every category (Watches, Sneakers, Accessories, Streetwear) was
stacked on the homepage one after another — a lot of scrolling. Now there's
a pill tab bar ("New In" + each category) right under the hero — tap one
and the grid swaps to just that category, with a live count of pieces.

**3. Search panel**
Tapping the magnifying glass in the header opens a search overlay. It
filters your live product catalog by name or category as you type, shows a
thumbnail + price for each match, and tapping a result takes you straight
to that product page. No results yet? It just says so instead of showing
nothing.

**4. Cleaner WhatsApp footer**
The footer used to print your raw WhatsApp number as plain text
(`+26772319455`). It's now a proper "Chat with us on WhatsApp" button that
opens the chat — the number itself isn't shown anywhere on the page.

## Setup steps

1. In Supabase → SQL Editor, run `migration_v6.sql`. It's safe to run once
   on top of everything before it — it adds the hero content + hero image
   columns to `settings` with sensible defaults, so nothing breaks if you
   don't touch `/admin/settings` right away.
2. Deploy as usual.
3. Go to `/admin/settings` and fill in the hero headline/subtitle/location/
   button text to your liking, and optionally upload a background photo.

## Test

- Load the homepage — you should see the new hero banner, then the pill
  tabs, then products.
- Tap a category pill and confirm the grid filters to just that category.
- Tap the search icon in the header, type a product name, and confirm it
  jumps to the right product page.
- Scroll to the footer and confirm there's a WhatsApp button and no raw
  phone number printed anywhere.
- Go to `/admin/settings`, upload a hero background image, save, and
  confirm it shows up behind the hero text on the homepage.

```
git add .
git commit -m "Add hero section, shop-by-category, search panel, cleaner WhatsApp footer"
git push
```
