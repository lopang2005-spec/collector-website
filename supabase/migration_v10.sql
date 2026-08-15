-- migration_v10.sql
-- Run this in Supabase: Project > SQL Editor > New query > paste all > Run
-- Safe to run once on top of everything before it (through migration_v9.sql).

-- ── CONTEXT ──────────────────────────────────────────────────────────────
-- Adds a per-product "hidden" flag so you can pull a product out of the
-- shop without deleting it, e.g. when a supplier is temporarily out of
-- stock. Hidden products stay in the admin panel (with a "Hidden" badge
-- and a one-click Unhide button) but disappear from the shop grid, the
-- student catalog, header search, and their own product page (direct link
-- 404s instead of showing a page customers could still order from).

alter table products add column if not exists is_hidden boolean not null default false;
