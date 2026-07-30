-- migration_v10.sql
-- Run this in Supabase: Project > SQL Editor > New query > paste all > Run

-- Adds the new "ready_for_pickup" stage (inserted after "out_for_delivery")
-- to the orders.current_stage check constraint. Keep in sync with
-- lib/orderStages.ts.
-- Note: the "sourcing" key still exists as-is — its label just changed
-- from "Sourcing / Packing" to "Packing" in the app, so no DB change is
-- needed for that part.

alter table orders drop constraint if exists orders_stage_check;
alter table orders add constraint orders_stage_check
  check (current_stage in (
    'placed', 'sourcing', 'export', 'transit', 'arrived',
    'out_for_delivery', 'ready_for_pickup', 'delivered'
  ));
