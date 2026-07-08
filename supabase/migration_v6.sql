-- migration_v6.sql
-- Run this in Supabase: Project > SQL Editor > New query > paste all > Run
-- Safe to run once on top of everything before it.

-- ── Hero section content ─────────────────────────────────────────────
-- Powers the new homepage hero (headline, subtitle, location tag, button
-- text, and an optional background image) editable from /admin/settings.

alter table settings
  add column if not exists hero_location text not null default 'Palapye, Botswana',
  add column if not exists hero_headline text not null default 'THE COLLECTOR',
  add column if not exists hero_subtitle text not null default
    'Curated streetwear, sneakers, accessories & watches — sourced, verified, and held to one standard.',
  add column if not exists hero_button_text text not null default 'Shop New Arrivals',
  add column if not exists hero_image_url text,
  add column if not exists hero_image_path text;
