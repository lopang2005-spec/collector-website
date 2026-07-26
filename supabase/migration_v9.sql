-- migration_v9.sql
-- Run this in Supabase: Project > SQL Editor > New query > paste all > Run
-- Safe to run once on top of everything before it (through migration_v8.sql).

-- ── CONTEXT ──────────────────────────────────────────────────────────────
-- This adds a second way into the student catalog, alongside the school-email
-- one from migration_v4.sql: a single unlock code you control from the admin
-- panel, with a start/expiry window and a kill switch. It also adds a
-- discount_amount field so you can put a Pula-off price on any product
-- (student-only or not) that only shows once a session is unlocked.
--
-- Students unlock with an anonymous Supabase session (no email/password) —
-- this needs "Allow anonymous sign-ins" turned on in
-- Supabase Dashboard > Authentication > Sign In / Providers.
-- Unlocks are re-checked every fresh browser session by design (see
-- StudentSessionGuard.tsx) — entering the code once doesn't unlock the
-- device permanently.

-- ── Per-product discount ────────────────────────────────────────────────
alter table products add column if not exists discount_amount numeric(10,2);

-- ── Unlock code settings — single row, id = 1 ──────────────────────────
create table if not exists student_unlock_settings (
  id int primary key default 1,
  code text not null default 'STUDENT',
  starts_at timestamptz,
  expires_at timestamptz,
  active boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into student_unlock_settings (id, code, active)
values (1, 'STUDENT', false)
on conflict (id) do nothing;

alter table student_unlock_settings enable row level security;

-- Students never read this table directly — they go through
-- redeem_student_code() below, which checks it server-side. Only the
-- admin panel reads/writes it directly.
create policy "Admins can view unlock settings"
  on student_unlock_settings for select
  to authenticated
  using (is_admin());

create policy "Admins can update unlock settings"
  on student_unlock_settings for update
  to authenticated
  using (is_admin());

-- ── Who has redeemed the code, keyed by their anonymous auth session ───
create table if not exists code_unlocks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  unlocked_at timestamptz not null default now()
);

alter table code_unlocks enable row level security;

create policy "Admins can view code unlocks"
  on code_unlocks for select
  to authenticated
  using (is_admin());

-- ── Attempt log — watch this if you suspect the code has leaked ────────
create table if not exists unlock_attempts (
  id uuid primary key default gen_random_uuid(),
  code_entered text not null,
  success boolean not null,
  user_id uuid,
  created_at timestamptz not null default now()
);

alter table unlock_attempts enable row level security;

create policy "Admins can view unlock attempts"
  on unlock_attempts for select
  to authenticated
  using (is_admin());

-- ── Redeem a code ────────────────────────────────────────────────────────
-- security definer so it can check student_unlock_settings and write to
-- code_unlocks/unlock_attempts even though students have no direct
-- read/write access to either table (same pattern as is_admin() below).
create or replace function redeem_student_code(input_code text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  settings_row student_unlock_settings;
  did_succeed boolean := false;
begin
  select * into settings_row from student_unlock_settings where id = 1;

  if settings_row.active
     and (settings_row.starts_at is null or now() >= settings_row.starts_at)
     and (settings_row.expires_at is null or now() <= settings_row.expires_at)
     and lower(trim(input_code)) = lower(trim(settings_row.code))
  then
    did_succeed := true;
    insert into code_unlocks (user_id, unlocked_at)
    values (auth.uid(), now())
    on conflict (user_id) do update set unlocked_at = now();
  end if;

  insert into unlock_attempts (code_entered, success, user_id)
  values (input_code, did_succeed, auth.uid());

  return did_succeed;
end;
$$;

grant execute on function redeem_student_code(text) to anon, authenticated;

-- ── Extend is_verified_student() to also accept a redeemed code ────────
-- Unchanged school-email branch; adds the code_unlocks check as an "or".
-- Anonymous sessions have no email, so the first branch is simply false
-- for them — no interaction between the two paths.
create or replace function is_verified_student()
returns boolean
language sql
security definer
set search_path = public
as $$
  select
    exists (
      select 1 from school_domains
      where active = true
        and domain = split_part(auth.email(), '@', 2)
    )
    or exists (
      select 1 from code_unlocks where user_id = auth.uid()
    );
$$;
