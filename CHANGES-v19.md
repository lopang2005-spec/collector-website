# v19: catalogs page, catalog buttons, product hiding

Built on v18 (price options and deposit). Run these in Supabase, in this
order, BEFORE deploying: migration_v10.sql, then migration_v11.sql.

## Flow
Shop Now goes straight to /catalogs, where the customer picks a catalog
button. There is no audience chooser.
- The student unlock code and school email logic is unchanged and still lives
  on /student.
- A customer who has unlocked student pricing sees student products in the
  catalogs, with a small "Not you? Sign out" bar. Everyone else sees the
  regular products. This is enforced in the catalog queries, and the database
  already blocks student products for anyone who is not unlocked.

## Catalog buttons
- /catalogs: grid of large picture cards, 2 columns on mobile, 3 on tablet,
  4 on desktop. All Items is always first.
- Categories load from the categories table. A new category gets a button
  automatically. Categories with no items for the customer are
  not shown as buttons.
- No picture, or a picture that fails to load: plain dark card with a gold border.
- /catalogs/all and /catalogs/<category-name> list the products, with a Back
  to Catalogs link, loading skeletons and an empty state.

## Admin: Catalog Buttons (/admin/catalogs)
- Upload or replace each picture (shrunk to 900px webp on your device first),
  remove a picture, edit the display name, move up or down, show or hide.
- Hiding a button does not hide its products. They stay in All Items.

## Product hiding
- New "Hide from store" tick box on the product form and a Hidden badge in the
  list. Hidden products are removed from the shop, student catalog, catalogs,
  search and the product page. The database policies also block them.

## Not changed
Cart, checkout, deposit breakdown, order numbers, WhatsApp message, student
unlock logic. The old /shop page still works.

## Other small changes
The menu Shop link now opens /catalogs.

## Files
New: migration_v11.sql, lib/slug.ts, lib/catalogs.ts,
lib/image-compress.ts, components/CatalogTile.tsx, CatalogGridSkeleton.tsx,
CatalogTilesManager.tsx,
app/catalogs/page.tsx, loading.tsx, app/catalogs/[slug]/page.tsx, loading.tsx,
app/admin/(dashboard)/catalogs/page.tsx
Changed: Hero.tsx, NavPanel.tsx, AdminNavPanel.tsx, admin layout.tsx,
ProductCard.tsx, ProductManager.tsx, Header.tsx, app/shop/page.tsx,
app/student/catalog/page.tsx, app/product/[id]/page.tsx
