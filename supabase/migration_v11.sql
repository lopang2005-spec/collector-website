-- migration_v11.sql
-- Run this in Supabase: Project > SQL Editor > New query > paste all > Run
-- Run order: migration_v10.sql first (price options and deposit), then this file.
-- Safe to run more than once. Run it BEFORE deploying v19.

-- 1. Product hiding
-- A hidden product is removed from every public page. Admins still see it
-- in /admin/products and can un-hide it.
alter table products
  add column if not exists hidden boolean not null default false;

-- Tighten the public read policies so hidden products are blocked by the
-- database itself, not only by the site code.
drop policy if exists "Public can view general products" on products;
create policy "Public can view general products"
  on products for select
  using (student_only = false and hidden = false);

drop policy if exists "Verified students can view student products" on products;
create policy "Verified students can view student products"
  on products for select
  to authenticated
  using (student_only = true and hidden = false and is_verified_student());

-- The existing "Admins can view all products" policy is left as is.

-- 2. Catalog buttons
-- One row per category button, plus one row for the "All Items" button.
create table if not exists catalog_tiles (
  id uuid primary key default gen_random_uuid(),
  category text unique
    references categories(name) on update cascade on delete cascade,
  is_all boolean not null default false,
  display_name text,
  image_url text,
  image_path text,
  sort_order integer not null default 0,
  visible boolean not null default true,
  updated_at timestamptz not null default now(),
  constraint catalog_tiles_kind_check
    check ((is_all and category is null) or (not is_all and category is not null))
);

-- Only one "All Items" row can exist.
create unique index if not exists catalog_tiles_one_all
  on catalog_tiles (is_all) where is_all;

alter table catalog_tiles enable row level security;

drop policy if exists "Public can view catalog tiles" on catalog_tiles;
create policy "Public can view catalog tiles"
  on catalog_tiles for select
  using (true);

drop policy if exists "Admins can insert catalog tiles" on catalog_tiles;
create policy "Admins can insert catalog tiles"
  on catalog_tiles for insert
  to authenticated
  with check (is_admin());

drop policy if exists "Admins can update catalog tiles" on catalog_tiles;
create policy "Admins can update catalog tiles"
  on catalog_tiles for update
  to authenticated
  using (is_admin())
  with check (is_admin());

drop policy if exists "Admins can delete catalog tiles" on catalog_tiles;
create policy "Admins can delete catalog tiles"
  on catalog_tiles for delete
  to authenticated
  using (is_admin());

-- Seed: the All Items row, then one row for every category that exists now.
insert into catalog_tiles (is_all, sort_order)
values (true, 0)
on conflict do nothing;

insert into catalog_tiles (category, sort_order)
select name, (row_number() over (order by created_at))::int * 10
from categories
on conflict (category) do nothing;

-- Any category you add later gets its own button automatically, placed last.
create or replace function create_catalog_tile_for_category()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into catalog_tiles (category, sort_order)
  values (
    new.name,
    coalesce((select max(sort_order) from catalog_tiles where not is_all), 0) + 10
  )
  on conflict (category) do nothing;
  return new;
end;
$$;

drop trigger if exists categories_create_tile on categories;
create trigger categories_create_tile
  after insert on categories
  for each row execute function create_catalog_tile_for_category();

-- 3. Storage bucket for catalog button pictures
insert into storage.buckets (id, name, public)
values ('catalog-tiles', 'catalog-tiles', true)
on conflict (id) do nothing;

-- Limit what can be uploaded: images only, 2 MB max (the admin page
-- compresses pictures to well under this before upload).
update storage.buckets
set file_size_limit = 2097152,
    allowed_mime_types = array['image/webp', 'image/jpeg', 'image/png']
where id = 'catalog-tiles';

drop policy if exists "Public can view catalog tile images" on storage.objects;
create policy "Public can view catalog tile images"
  on storage.objects for select
  using (bucket_id = 'catalog-tiles');

drop policy if exists "Admins can upload catalog tile images" on storage.objects;
create policy "Admins can upload catalog tile images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'catalog-tiles' and public.is_admin());

drop policy if exists "Admins can update catalog tile images" on storage.objects;
create policy "Admins can update catalog tile images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'catalog-tiles' and public.is_admin());

drop policy if exists "Admins can delete catalog tile images" on storage.objects;
create policy "Admins can delete catalog tile images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'catalog-tiles' and public.is_admin());
