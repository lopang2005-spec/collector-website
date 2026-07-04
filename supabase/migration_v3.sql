-- migration_v3.sql
-- Run this in Supabase: Project > SQL Editor > New query > paste all > Run

-- Adds a proper multi-image gallery per product.
-- `image_url` stays as-is (used as the main/thumbnail image everywhere it
-- already was — product cards, cart, WhatsApp message) so nothing else
-- breaks. `images` is the full gallery array shown on the product page.

alter table products add column if not exists images text[] not null default '{}';

-- Backfill: for any existing product that only has image_url set,
-- put that single image into the new images array too.
update products
set images = array[image_url]
where images = '{}' and image_url is not null;
