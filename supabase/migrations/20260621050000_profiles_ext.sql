-- ============================================================================
-- 0005 profiles_ext — personal info + soft delete
-- Module: profile
-- Adds first_name/last_name/age/deleted_at to profiles, enforces age >= 18,
-- and extends the new-user trigger to copy registration metadata.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- New columns
-- ----------------------------------------------------------------------------
alter table public.profiles add column if not exists first_name text;
alter table public.profiles add column if not exists last_name  text;
alter table public.profiles add column if not exists age        int;
-- Soft delete: non-null means the account is deactivated (data hidden, user
-- signed out). Reactivation clears it back to null.
alter table public.profiles add column if not exists deleted_at timestamptz;

-- Minimum age 18. Allows null (legacy rows / not yet provided).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_age_min'
  ) then
    alter table public.profiles
      add constraint profiles_age_min check (age is null or age >= 18);
  end if;
end$$;

create index if not exists profiles_deleted_at_idx
  on public.profiles (deleted_at);

-- ----------------------------------------------------------------------------
-- Extend the new-user trigger to populate name/age from signup metadata.
-- The Register screen passes these via auth.signUp({ options: { data } }),
-- which lands in auth.users.raw_user_meta_data.
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  fn   text  := nullif(trim(meta ->> 'first_name'), '');
  ln   text  := nullif(trim(meta ->> 'last_name'), '');
  ag   int   := nullif(meta ->> 'age', '')::int;
begin
  insert into public.profiles (id, phone, first_name, last_name, age, display_name)
  values (
    new.id,
    new.phone,
    fn,
    ln,
    ag,
    nullif(trim(concat_ws(' ', fn, ln)), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
