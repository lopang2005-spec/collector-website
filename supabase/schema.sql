-- Run this in Supabase: Project > SQL Editor > New query > paste all > Run

-- ── Products ────────────────────────────────────────────────────────────
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10,2) not null default 0,
  category text not null default 'Streetwear',
  image_url text,
  created_at timestamptz not null default now()
);

alter table products enable row level security;

-- Anyone can view products (storefront is public).
create policy "Public can view products"
  on products for select
  using (true);

-- Only signed-in admins can add/edit/delete.
create policy "Authenticated users can insert products"
  on products for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update products"
  on products for update
  to authenticated
  using (true);

create policy "Authenticated users can delete products"
  on products for delete
  to authenticated
  using (true);

-- ── Site settings (branding) — single row, id = 1 ─────────────────────
create table if not exists settings (
  id int primary key default 1,
  site_name text not null default 'The Collector',
  whatsapp_number text not null default '26772319455',
  logo_url text,
  logo_path text,
  updated_at timestamptz not null default now()
);

insert into settings (id, site_name, whatsapp_number)
values (1, 'The Collector', '26772319455')
on conflict (id) do nothing;

alter table settings enable row level security;

create policy "Public can view settings"
  on settings for select
  using (true);

create policy "Authenticated users can update settings"
  on settings for update
  to authenticated
  using (true);

create policy "Authenticated users can insert settings"
  on settings for insert
  to authenticated
  with check (true);

-- ── Storage buckets ─────────────────────────────────────────────────────
-- Run these, then double check in Storage > Buckets that both show "Public".
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('branding', 'branding', true)
on conflict (id) do nothing;

create policy "Public can view product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Authenticated users can upload product images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images');

create policy "Authenticated users can delete product images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images');

create policy "Public can view branding files"
  on storage.objects for select
  using (bucket_id = 'branding');

create policy "Authenticated users can upload branding files"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'branding');

create policy "Authenticated users can delete branding files"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'branding');
