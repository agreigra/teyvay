-- ============================================================================
-- 0001 core_init — enums, profiles, role helpers, new-user trigger
-- Module: core
-- Idempotent where practical so the migration is safe to reason about.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('admin', 'sailor', 'client');
  end if;
  if not exists (select 1 from pg_type where typname = 'announcement_status') then
    create type public.announcement_status as enum ('active', 'sold', 'inactive');
  end if;
end$$;

-- ----------------------------------------------------------------------------
-- profiles — 1:1 with auth.users. Phone lives in auth.users; we mirror role
-- and display data here. id is the auth user id.
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  phone        text,
  role         public.user_role not null default 'client',
  display_name text,
  created_at   timestamptz not null default now()
);

comment on table public.profiles is 'App profile per auth user. role drives RLS.';

-- ----------------------------------------------------------------------------
-- Auto-create a profile row whenever a new auth user is created.
-- Default role is the safest one (client); admin is granted manually via SQL.
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, phone)
  values (new.id, new.phone)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- Role helpers. SECURITY DEFINER so RLS policies can read a caller's role
-- WITHOUT recursing into profiles' own policies.
-- ----------------------------------------------------------------------------
create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'admin', false);
$$;
