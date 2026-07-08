-- migration_v5.sql
-- Run this in Supabase: Project > SQL Editor > New query > paste all > Run
-- Safe to run once on top of everything before it.

-- ── Categories (customizable, admin-managed) ────────────────────────────
-- Until now, "category" was just a free-text column on products, and the
-- admin form picked from a hardcoded list baked into the code (Streetwear,
-- Sneakers, Accessories, Watches). This adds a real table so you can add,
-- rename, or delete categories from /admin/categories without touching code.

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

alter table categories enable row level security;

create policy "Public can view categories"
  on categories for select
  using (true);

create policy "Admins can insert categories"
  on categories for insert
  to authenticated
  with check (is_admin());

create policy "Admins can update categories"
  on categories for update
  to authenticated
  using (is_admin());

create policy "Admins can delete categories"
  on categories for delete
  to authenticated
  using (is_admin());

-- Backfill: bring in every category name already used by a product, plus
-- the original four defaults, so nothing on the live site breaks.
insert into categories (name)
select distinct category from products
on conflict (name) do nothing;

insert into categories (name)
values ('Streetwear'), ('Sneakers'), ('Accessories'), ('Watches')
on conflict (name) do nothing;

-- Tie products.category to a real category row. on update cascade means
-- renaming a category in /admin/categories instantly relabels every
-- product that used the old name — no separate "rename products" step.
-- on delete restrict means the database itself refuses to delete a
-- category while products still point to it, backing up the "move
-- products first" flow in the admin UI.
alter table products
  drop constraint if exists products_category_fkey;

alter table products
  add constraint products_category_fkey
  foreign key (category) references categories(name)
  on update cascade
  on delete restrict;
