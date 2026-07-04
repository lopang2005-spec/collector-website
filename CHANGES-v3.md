# v3 changes — multiple images per product

## 1. Run the SQL migration

Supabase → SQL Editor → New query → paste `supabase/migration_v3.sql` → Run.

This adds an `images` array column and automatically copies each product's
existing single image into it, so nothing disappears.

## 2. What changed

- **Admin (`/admin/products`)**: the image field now accepts multiple photos
  at once (or added one at a time over multiple visits). Each uploaded photo
  shows as a thumbnail — tap one to set it as the "Main" image (used on the
  homepage card, cart, and WhatsApp message). Tap the × to remove one.
- **Product page**: now shows a full gallery — a large main image with a
  thumbnail strip underneath. Tapping a thumbnail swaps the main image.
  Products with only one photo look exactly as before (no thumbnail strip
  shown).
- Homepage cards, cart, and the WhatsApp message still use a single "main"
  image, unchanged — only the product page itself gained the gallery.

## 3. Testing checklist

1. Edit an existing product in `/admin/products` — confirm its old photo
   already shows in the gallery (migrated automatically).
2. Upload 2-3 more photos to that product, save.
3. Open the product page — confirm all photos show as thumbnails and
   clicking each one swaps the main image.
4. Set a different photo as "Main" in admin, save, refresh the homepage —
   confirm the card now shows that photo.
