-- ============================================================================
-- 0013 profiles_email — optional contact email
-- Module: profile
-- Adds an optional `email` column (collected at registration, editable on the
-- profile). Stored only on the profile — NOT used as the auth identifier.
-- ============================================================================

alter table public.profiles add column if not exists email text;

-- Light sanity check: allow null/empty or a basic name@domain.tld shape.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_email_format'
  ) then
    alter table public.profiles
      add constraint profiles_email_format
      check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');
  end if;
end$$;

-- ----------------------------------------------------------------------------
-- New-user trigger: also copy email from signup metadata.
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
  em   text  := nullif(trim(meta ->> 'email'), '');
  bd   date  := nullif(meta ->> 'birthdate', '')::date;
  ag   int   := case when bd is not null
                     then extract(year from age(bd))::int
                     else nullif(meta ->> 'age', '')::int end;
begin
  insert into public.profiles (id, phone, first_name, last_name, email, birthdate, age, display_name)
  values (
    new.id,
    new.phone,
    fn,
    ln,
    em,
    bd,
    ag,
    nullif(trim(concat_ws(' ', fn, ln)), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
