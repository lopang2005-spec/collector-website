-- migration_v10.sql
-- Run this in Supabase: Project > SQL Editor > New query > paste all > Run
-- Safe to run once on top of everything before it (through migration_v9.sql).
-- Run it BEFORE deploying v18.

-- Multiple price options per product (e.g. watch: Basic box / Premium box).
-- Format: [{"label": "Basic box", "price": 1200}, {"label": "Premium box", "price": 1800}]
-- Empty array = product uses its normal single price.
alter table products
  add column if not exists price_options jsonb not null default '[]';

-- Deposit percentage shown at checkout, editable in /admin/settings.
alter table settings
  add column if not exists deposit_percent numeric(5,2) not null default 60;

alter table settings drop constraint if exists settings_deposit_percent_check;
alter table settings add constraint settings_deposit_percent_check
  check (deposit_percent >= 0 and deposit_percent <= 100);
