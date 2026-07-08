# v10 — customizable categories, swipeable product gallery, social links

## What this adds

**1. Customizable categories**
Categories used to be a hardcoded list in the code (Streetwear, Sneakers,
Accessories, Watches) — changing them meant editing code and redeploying.
Now they're a real database table you manage at `/admin/categories`:

- Add a new category any time.
- Rename one — every product using it updates automatically, instantly.
- Delete one — if products still use it, you're asked to move them to
  another category first (a dropdown handles the move + delete in one
  step), so nothing gets silently orphaned.

The shop page and the "Add product" category dropdown both now read from
this table instead of the old hardcoded list.

**2. Swipeable product image gallery**
On the product page, you can now swipe left/right through a product's
photos on mobile (not just tap the thumbnail strip). Also added: left/
right arrow buttons, a "2 / 5" counter, and dot indicators — same pattern
as the gallery preview you sent over.

**3. Instagram & TikTok links in the footer**
The footer now has clickable Instagram and TikTok icons, plus the
`@connoisseur.bw` text itself links out to Instagram. Both open in a new
tab so customers don't lose their place on the site.

- Instagram: connoisseur.bw
- TikTok: @the.collectors.ma

## Setup steps

1. In Supabase → SQL Editor, run `migration_v5.sql`. It's safe to run once
   on top of everything before it — it creates the `categories` table,
   backfills it with whatever categories your products already use (plus
   the original four defaults), and links `products.category` to it.
2. Deploy as usual.
3. Go to `/admin/categories` and confirm your categories look right —
   rename or add any you want.

## Test

- Add a new category at `/admin/categories`, then check it shows up in
  the category dropdown when adding/editing a product.
- Rename a category that has products — refresh the shop page and confirm
  those products now show the new category name.
- Try deleting a category with products in it — you should get the "move
  first" prompt instead of an error.
- Open a product with multiple photos on your phone and swipe across the
  main image.
- Scroll to the bottom of the site and tap the Instagram and TikTok icons.

```
git add .
git commit -m "Add customizable categories, swipeable product gallery, social links"
git push
```
