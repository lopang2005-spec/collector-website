-- migration_v7.sql
-- Run this in Supabase: Project > SQL Editor > New query > paste all > Run
-- Safe to run once on top of everything before it.

-- ── Customizable social links ────────────────────────────────────────
-- Makes Instagram/TikTok URLs editable from /admin/settings instead of
-- being hardcoded in the Footer component.

alter table settings
  add column if not exists instagram_url text not null default
    'https://www.instagram.com/connoisseur.bw?igsh=MXZsb3lmaTQ4eG10dQ%3D%3D&utm_source=qr',
  add column if not exists tiktok_url text not null default
    'https://www.tiktok.com/@the.collectors.ma?_r=1&_t=ZS-97q5p1h4CsX';
