-- migration_v4.sql
-- Run this in Supabase: Project > SQL Editor > New query > paste all > Run
-- Safe to run once on top of everything before it.

-- ── IMPORTANT CONTEXT ────────────────────────────────────────────────────
-- Every policy so far has used "to authenticated using (true)" for admin
-- actions (add/edit/delete products, settings, orders). That was safe only
-- because the ONLY person who could ever be "authenticated" was you.
--
-- This migration adds student sign-in, which means verified students will
-- also become "authenticated" users. So this migration does two things at
-- once: (1) adds student verification, and (2) rewrites every admin policy
-- to check "is this person actually the admin" instead of "is this person
-- logged in as anyone." Skipping part 2 would let a verified student edit
-- your products or change your WhatsApp number.

-- ── Admins ──────────────────────────────────────────────────────────────
create table if not exists admins (
  email text primary key
);

alter table admins enable row level security;
-- Deliberately no select/insert/update/delete policies for anyone via the
-- API — this table is only ever read from inside the security-definer
-- function below. Add/remove admins directly in the SQL Editor.

-- Add yourself as admin now (use the exact email you log into /admin with):
insert into admins (email) values ('YOUR-ADMIN-EMAIL@example.com')
on conflict (email) do nothing;

create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from admins where email = auth.email()
  );
$$;

grant execute on function is_admin() to anon, authenticated;

-- ── Schools (email domains eligible for the student catalog) ───────────
create table if not exists school_domains (
  domain text primary key,       -- e.g. 'biust.ac.bw' (no @)
  school_name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table school_domains enable row level security;

create policy "Admins can view school domains"
  on school_domains for select
  to authenticated
  using (is_admin());

create policy "Admins can insert school domains"
  on school_domains for insert
  to authenticated
  with check (is_admin());

create policy "Admins can update school domains"
  on school_domains for update
  to authenticated
  using (is_admin());

create policy "Admins can delete school domains"
  on school_domains for delete
  to authenticated
  using (is_admin());

create or replace function is_verified_student()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from school_domains
    where active = true
      and domain = split_part(auth.email(), '@', 2)
  );
$$;

grant execute on function is_verified_student() to anon, authenticated;

-- ── Products: student-only flag ─────────────────────────────────────────
alter table products add column if not exists student_only boolean not null default false;

-- Replace the old "anyone can see everything" policy with three narrower
-- ones: the general catalog stays fully public; student-only items are
-- only visible to sessions that pass is_verified_student(); admins see all.
drop policy if exists "Public can view products" on products;

create policy "Public can view general products"
  on products for select
  using (student_only = false);

create policy "Verified students can view student products"
  on products for select
  to authenticated
  using (student_only = true and is_verified_student());

create policy "Admins can view all products"
  on products for select
  to authenticated
  using (is_admin());

-- Admin write policies, now checking is_admin() instead of "any logged-in user".
drop policy if exists "Authenticated users can insert products" on products;
drop policy if exists "Authenticated users can update products" on products;
drop policy if exists "Authenticated users can delete products" on products;

create policy "Admins can insert products"
  on products for insert
  to authenticated
  with check (is_admin());

create policy "Admins can update products"
  on products for update
  to authenticated
  using (is_admin());

create policy "Admins can delete products"
  on products for delete
  to authenticated
  using (is_admin());

-- ── Settings: same tightening ────────────────────────────────────────────
drop policy if exists "Authenticated users can update settings" on settings;
drop policy if exists "Authenticated users can insert settings" on settings;

create policy "Admins can update settings"
  on settings for update
  to authenticated
  using (is_admin());

create policy "Admins can insert settings"
  on settings for insert
  to authenticated
  with check (is_admin());

-- ── Orders: same tightening ──────────────────────────────────────────────
drop policy if exists "Authenticated users can view orders" on orders;
drop policy if exists "Authenticated users can insert orders" on orders;
drop policy if exists "Authenticated users can update orders" on orders;
drop policy if exists "Authenticated users can delete orders" on orders;

create policy "Admins can view orders"
  on orders for select
  to authenticated
  using (is_admin());

create policy "Admins can insert orders"
  on orders for insert
  to authenticated
  with check (is_admin());

create policy "Admins can update orders"
  on orders for update
  to authenticated
  using (is_admin());

create policy "Admins can delete orders"
  on orders for delete
  to authenticated
  using (is_admin());

-- ── Storage: same tightening ─────────────────────────────────────────────
drop policy if exists "Authenticated users can upload product images" on storage.objects;
drop policy if exists "Authenticated users can delete product images" on storage.objects;
drop policy if exists "Authenticated users can upload branding files" on storage.objects;
drop policy if exists "Authenticated users can delete branding files" on storage.objects;

create policy "Admins can upload product images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "Admins can delete product images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

create policy "Admins can upload branding files"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'branding' and public.is_admin());

create policy "Admins can delete branding files"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'branding' and public.is_admin());
