-- migration_v2.sql
-- Run this in Supabase: Project > SQL Editor > New query > paste all > Run
-- Safe to run once on top of the existing schema.sql — only adds new things.

-- ── Products: colors, sizes, availability ──────────────────────────────
alter table products add column if not exists colors jsonb not null default '[]';
-- colors format: [{"label": "Black", "hex": "#1a1a1a"}, ...]

alter table products add column if not exists sizes text[] not null default '{}';
-- sizes format: ["S", "M", "L"] or ["40", "41", "42"] — free text, your call per product

alter table products add column if not exists availability text not null default 'in_stock';
alter table products drop constraint if exists products_availability_check;
alter table products add constraint products_availability_check
  check (availability in ('in_stock', 'by_order'));

-- ── Orders: tracking ─────────────────────────────────────────────────────
create table if not exists orders (
  id text primary key,              -- your existing order number, e.g. "TC-0182"
  customer_name text not null default 'Customer',
  current_stage text not null default 'placed',
  updated_at timestamptz not null default now(),
  history jsonb not null default '[]'  -- [{ "stage": "placed", "note": "", "timestamp": "..." }]
);

alter table orders drop constraint if exists orders_stage_check;
alter table orders add constraint orders_stage_check
  check (current_stage in (
    'placed', 'sourcing', 'export', 'transit', 'arrived', 'out_for_delivery', 'delivered'
  ));

alter table orders enable row level security;

-- IMPORTANT: no public "select" policy on the orders table itself.
-- This is intentional — it stops anyone from listing every order (the exact
-- problem you flagged with the courier dashboard). Public lookups only ever
-- go through the function below, which returns one order at a time.

create policy "Authenticated users can view orders"
  on orders for select
  to authenticated
  using (true);

create policy "Authenticated users can insert orders"
  on orders for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update orders"
  on orders for update
  to authenticated
  using (true);

create policy "Authenticated users can delete orders"
  on orders for delete
  to authenticated
  using (true);

-- Public, single-order lookup function — the only way an anonymous visitor
-- can read order data, and only if they already know the exact order number.
create or replace function get_order_status(order_id text)
returns table (customer_name text, current_stage text, history jsonb)
language sql
security definer
set search_path = public
as $$
  select customer_name, current_stage, history
  from orders
  where id = order_id;
$$;

grant execute on function get_order_status(text) to anon, authenticated;
