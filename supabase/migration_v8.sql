-- migration_v8.sql
-- Run this in Supabase: Project > SQL Editor > New query > paste all > Run
-- Safe to run once on top of everything before it.

-- ── Suggestion box ───────────────────────────────────────────────────
-- Lets customers send free-text feedback/requests, with an optional
-- name/contact and an optional photo. Visible only to admins.

create table if not exists suggestions (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  contact text,               -- optional name / WhatsApp number, customer-supplied
  image_path text,            -- storage path in the 'suggestion-images' bucket
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table suggestions enable row level security;

-- Anyone (including anonymous storefront visitors) can submit a suggestion,
-- but they can only INSERT — they cannot read, update, or delete rows,
-- so one customer can never see another customer's message.
create policy "Public can submit suggestions"
  on suggestions for insert
  to anon, authenticated
  with check (true);

-- Only signed-in admins can view, update (mark read), or delete.
create policy "Authenticated users can view suggestions"
  on suggestions for select
  to authenticated
  using (true);

create policy "Authenticated users can update suggestions"
  on suggestions for update
  to authenticated
  using (true);

create policy "Authenticated users can delete suggestions"
  on suggestions for delete
  to authenticated
  using (true);

-- ── Storage bucket for suggestion photos ────────────────────────────
-- Not public: images are only readable via signed URLs the admin panel
-- generates, so a suggestion photo can't be guessed/browsed by URL.
insert into storage.buckets (id, name, public)
values ('suggestion-images', 'suggestion-images', false)
on conflict (id) do nothing;

create policy "Public can upload suggestion images"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'suggestion-images');

create policy "Authenticated users can view suggestion images"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'suggestion-images');

create policy "Authenticated users can delete suggestion images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'suggestion-images');
