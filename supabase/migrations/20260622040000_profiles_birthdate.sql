-- ============================================================================
-- 0011 profiles_birthdate — store birthdate, derive age
-- Module: profile
-- Adds a `birthdate` date column as the source of truth for age. The legacy
-- `age` column is kept (consistency) and derived from birthdate by the trigger.
-- ============================================================================

alter table public.profiles add column if not exists birthdate date;

-- Backfill an approximate birthdate for legacy rows that only have age.
update public.profiles
   set birthdate = make_date(extract(year from current_date)::int - age, 1, 1)
 where birthdate is null and age is not null;

-- Minimum age 18, enforced on birthdate. Allows null (not yet provided).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_birthdate_adult'
  ) then
    alter table public.profiles
      add constraint profiles_birthdate_adult
      check (birthdate is null or birthdate <= (current_date - interval '18 years'));
  end if;
end$$;

-- ----------------------------------------------------------------------------
-- New-user trigger: copy birthdate from signup metadata and derive age from it.
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
  bd   date  := nullif(meta ->> 'birthdate', '')::date;
  ag   int   := case when bd is not null
                     then extract(year from age(bd))::int
                     else nullif(meta ->> 'age', '')::int end;
begin
  insert into public.profiles (id, phone, first_name, last_name, birthdate, age, display_name)
  values (
    new.id,
    new.phone,
    fn,
    ln,
    bd,
    ag,
    nullif(trim(concat_ws(' ', fn, ln)), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
